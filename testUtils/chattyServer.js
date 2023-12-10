const lines = [
  '<script>alert(1)</script>',
  'A                    B                        C',
  '200 GET /1/geocode?address=ny',
  '200 GET /1/config',
  '500 GET /1/users/556605ede9fa35333befa9e6/profile',
  '200 POST /1/signin',
  '200 GET /1/users/556605ede9fa35333befa9e6/profile',
  '200 PUT /1/me/gcm_tokens/duUOo8jRIxq547jAaAHvsF9v',
  '200 PUT /1/me/review_status/seen',
  '301 GET /1/config',
  '200 GET /1/users/555f7494e9fa35333befa9ab/profile',
  '200 POST /1/signin',
  '200 GET /1/users/555f7494e9fa35333befa9ab/profile',
  '400 PUT /1/me/gcm_tokens/3G7ggYFcGXIHkIgaGLW16s4sobrkAPA91bGM8t9MJwfDbFA',
  '200 GET /1/me/notifications',
  '200 GET /1/me/picture',
  '200 GET /1/alive'
];

setInterval(() => {
  console.log(lines[Math.floor(Math.random() * lines.length)]);
}, 3000);