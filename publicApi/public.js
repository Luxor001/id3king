module.exports = [
  {
      method: 'POST',
      path: '/getData',
      handler: function (request, reply) {
          reply({test: 'prova', test: true})
      }
  },
  {
  method: 'GET',
   path: '/{param*}',
   handler: {
       directory: {
           path: '.',
           redirectToSlash: true,
           index: true
       }
   }
 }
];
