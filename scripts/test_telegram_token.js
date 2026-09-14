fetch('https://api.telegram.org/bot8192452835:AAHWLe_s58eARXlaAXepHV8YSY8jkX5LMsk/getMe')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
