/* Contact form: sends the details through Web3Forms (https://web3forms.com) to the company mailbox.
   The access key in data-key on the form is meant to be public (it only allows sending to that mailbox). */
(function () {
  var form = document.getElementById("contact-form-el");
  if (!form) return;
  var btn = form.querySelector("button[type=submit]");
  var btnText = btn.textContent;
  var err = document.getElementById("c-error"), sent = document.getElementById("c-sent"), failed = document.getElementById("c-failed");
  function v(id) { return document.getElementById(id).value.trim(); }
  function label(id) { return document.querySelector('label[for="' + id + '"]').firstChild.textContent.trim(); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sent.hidden = true; failed.hidden = true;
    var name = v("c-name"), email = v("c-email"), subject = v("c-subject"), msg = v("c-msg");
    var valid = name.length > 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && msg.length > 0;
    err.hidden = valid;
    if (!valid) return;
    if (form.botcheck.checked) { sent.hidden = false; return; }   // a robot filled the hidden field: pretend, send nothing
    var data = {
      access_key: form.dataset.key,
      subject: form.dataset.subject + (subject ? " - " + subject : "") + " (" + name + ")",
      from_name: "D-Way website",
      replyto: email,
      botcheck: false
    };
    ["c-name", "c-org", "c-email", "c-phone", "c-subject", "c-msg"].forEach(function (id) { data[label(id)] = v(id); });
    btn.disabled = true; btn.textContent = btn.dataset.sending;
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.success) throw new Error("not sent");
      form.reset(); sent.hidden = false;
    }).catch(function () {
      failed.hidden = false;
    }).then(function () {
      btn.disabled = false; btn.textContent = btnText;
    });
  });
})();
