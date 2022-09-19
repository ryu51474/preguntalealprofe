const express = require('express');
const appExpress = express();
const {Client, LocalAuth,Buttons,List} = require('whatsapp-web.js');
const qrcodeweb = require('node-qr-image');
const cleverbot = require('cleverbot-free');
const validadorEmail = require('email-validator');
const { validate, clean, format, getCheckDigit } = require('rut.js');
const validaRut = (rut)=>{return validate(rut)};

appExpress.get('/', (req, res) => {
    res.send('Pagina principal. para encontrar el codigo qr escriba /qr al final en esta barra de direcciones')
});

cliente = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true },
  });

  cliente.on("qr", (qr) => {
    console.log("no habia sesion iniciada");
    console.log(`se inicia sesion, por favor escanee el qr de arriba o visite http://localhost:3000/qr`);
    appExpress.get('/qr',(req,responseweb)=>{
      let qrEnPagina=qrcodeweb.imageSync(qr.toString(),{type:'svg',size:5})
      responseweb.send(qrEnPagina)
    })
  });
  cliente.on("ready", () => {
    console.log("cliente inicializado, ya se puede operar");
  });
  cliente.on("auth_failure", (errorAutenticacion) => {
    console.log("fallo el inicio de sesion porque: ", errorAutenticacion);
    // connectionLost()
  });

cliente.initialize();
appExpress.listen(3000, function () {
    console.log('Server is running: http://localhost:3000');
});