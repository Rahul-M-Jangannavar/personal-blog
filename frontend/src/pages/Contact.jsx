import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { sendContact } from "../api/blog";
import { ApiError } from "../api/errors";
import { ErrorMessage } from "../components/ErrorMessage";
import { Spinner } from "../components/Spinner";

const EMPTY = { name: "", email: "", subject: "", message: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email.";
  }
  if (!values.subject.trim()) errors.subject = "Subject is required.";
  if (!values.message.trim()) errors.message = "Message is required.";
  return errors;
}

export function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: sendContact,
    onSuccess: () => {
      setSuccess(true);
      setValues(EMPTY);
      setErrors({});
    },
    onError: (err) => {
      if (err instanceof ApiError) setErrors(err.fieldErrors);
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSuccess(false);
    if (Object.keys(nextErrors).length > 0) return;
    mutation.mutate(values);
  }

  return (
    <div className="stack">
      <h1>Contact</h1>
      <p className="muted">Please leave a message for any suggestions</p>

      {success ? (
        <p className="status status-success" role="status">
          Thanks — I will read this in admin.
        </p>
      ) : null}

      <ErrorMessage
        message={
          mutation.isError && Object.keys(errors).length === 0
            ? mutation.error.message
            : null
        }
      />

      <form className="stack" onSubmit={handleSubmit} noValidate>
        <label className="field">
          Name
          <input name="name" value={values.name} onChange={handleChange} />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </label>
        <label className="field">
          Email
          <input name="email" type="email" value={values.email} onChange={handleChange} />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </label>
        <label className="field">
          Subject
          <input name="subject" value={values.subject} onChange={handleChange} />
          {errors.subject ? <span className="field-error">{errors.subject}</span> : null}
        </label>
        <label className="field">
          Message
          <textarea name="message" rows={6} value={values.message} onChange={handleChange} />
          {errors.message ? <span className="field-error">{errors.message}</span> : null}
        </label>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending…" : "Send"}
        </button>
        {mutation.isPending ? <Spinner label="Sending your message…" /> : null}
      </form>
    </div>
  );
}
