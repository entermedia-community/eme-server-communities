/* Meeting Request dialog. Any link with class "meeting-link" opens it.
   Slots come from ./meetingschedule/meeting-form.html and the request is saved by ./meetingschedule/save.html */
(function () {
  var HASH = '#open-schedule-meeting';
  var dlg, body;

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function build() {
    if (dlg) return;
    dlg = document.createElement('dialog');
    dlg.className = 'meeting-dialog';
    dlg.setAttribute('aria-labelledby', 'meeting-h');
    dlg.innerHTML = '<button type="button" class="md-close" aria-label="Close">&times;</button><div class="md-body"></div>';
    document.body.appendChild(dlg);
    body = dlg.querySelector('.md-body');
    dlg.querySelector('.md-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () {
      if (location.hash === HASH) history.replaceState(null, '', location.pathname + location.search);
    });
  }

  function formHtml(slots, base) {
    var opts = slots.map(function (s) { return '<option value="' + esc(s.value) + '">' + esc(s.label) + '</option>'; }).join('');
    return '<h2 id="meeting-h">Meeting Request</h2>' +
      '<p class="md-sub">Schedule a meeting with the EME World team.</p>' +
      '<form class="md-form" method="post" action="' + base + 'meetingschedule/save.html">' +
      '<div class="md-row"><label>First name<input name="name.value" required autocomplete="given-name"></label>' +
      '<label>Last name<input name="lastname.value" required autocomplete="family-name"></label></div>' +
      '<label>Email<input type="email" name="email.value" required autocomplete="email"></label>' +
      '<label>Tell us about your project<textarea name="notes.value" rows="4" required></textarea></label>' +
      '<fieldset><legend>Which team would you like to meet?</legend>' +
      '<label class="md-radio"><input type="radio" name="meetingdepartment.value" value="sales" checked> Sales and introductions</label>' +
      '<label class="md-radio"><input type="radio" name="meetingdepartment.value" value="support"> Technical support</label></fieldset>' +
      '<label>Date and time (our time zone)<select name="time.value" required>' + opts + '</select></label>' +
      '<p class="md-note">We will email you a link to join the video conference.</p>' +
      '<input type="hidden" name="field" value="name"><input type="hidden" name="field" value="lastname">' +
      '<input type="hidden" name="field" value="email"><input type="hidden" name="field" value="notes">' +
      '<input type="hidden" name="field" value="meetingdepartment"><input type="hidden" name="field" value="time">' +
      '<input type="hidden" name="save" value="true">' +
      '<p class="md-error" role="alert" hidden></p>' +
      '<button type="submit" class="btn">Submit</button></form>';
  }

  function open(url) {
    build();
    var base = url.replace(/meetingschedule\/meeting-form\.html.*$/, '');
    body.innerHTML = '<p class="md-sub">Loading...</p>';
    if (!dlg.open) dlg.showModal();
    // loading the form also starts the server side session needed to accept the submit
    fetch(url, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('load');
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var slots = [].slice.call(doc.querySelectorAll('#meetingtime option')).filter(function (o) { return o.value !== 'custom'; })
        .map(function (o) { return { value: o.value, label: o.textContent.trim() }; });
      body.innerHTML = formHtml(slots, base);
      var form = body.querySelector('form');
      var err = body.querySelector('.md-error');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        err.hidden = true;
        var btn = form.querySelector('button[type=submit]');
        btn.disabled = true;
        fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)), credentials: 'same-origin' })
          .then(function (r) { if (!r.ok) throw new Error('save'); return r.text(); })
          .then(function (txt) {
            if (/errorcode|Form re-submit/i.test(txt) && !/Thank You/i.test(txt)) throw new Error('save');
            body.innerHTML = '<h2 id="meeting-h">Thank you</h2><p class="md-sub">We will confirm with you by email.</p><button type="button" class="btn md-done">Close</button>';
            body.querySelector('.md-done').addEventListener('click', function () { dlg.close(); });
          }).catch(function () {
            btn.disabled = false;
            err.textContent = 'Sorry, we could not send your request. Please try again or email cburkey@eme.world.';
            err.hidden = false;
          });
      });
      var first = form.querySelector('input'); if (first) first.focus();
    }).catch(function () {
      body.innerHTML = '<h2 id="meeting-h">Meeting Request</h2><p class="md-sub">Sorry, the form could not load. Please email cburkey@eme.world.</p>';
    });
  }

  function urlOf(a) { return a.getAttribute('data-url') || './meetingschedule/meeting-form.html'; }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a.meeting-link') : null;
    if (!a) return;
    e.preventDefault();
    if (a.getAttribute('data-updateurl') === 'true') history.replaceState(null, '', location.pathname + location.search + HASH);
    open(urlOf(a));
  });

  if (location.hash === HASH) {
    var link = document.querySelector('a.meeting-link');
    open(link ? urlOf(link) : './meetingschedule/meeting-form.html');
  }
})();
