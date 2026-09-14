fetch('https://cigar-lounge-one.vercel.app/api/telegram/setup')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
