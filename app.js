const express = require('express');
const appExpress = express();
const {Client, LocalAuth,Buttons,List} = require('whatsapp-web.js');
//const codigoqr = require("qrcode-terminal");//por render
const qrcodeweb = require('node-qr-image');
const cleverbot = require('cleverbot-free');
const validadorEmail = require('email-validator');
const { validate, clean, format, getCheckDigit } = require('rut.js');
const validaRut = (rut)=>{return validate(rut)};

const puerto=process.env.PORT||3000
appExpress.get('/', (req, res) => {
    res.send('Pagina principal. para encontrar el codigo qr escriba /qr al final en esta barra de direcciones')
});

cliente = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true , args: ['--no-sandbox','--disable-setuid-sandbox']},
  });

  cliente.on("qr", (qr) => {
    console.log("no habia sesion iniciada");
    //codigoqr.generate(qr, { small: true , size:5});
    console.log(`se inicia sesión, por favor escanee el qr de arriba o visite http://localhost:${puerto}/qr`);
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
appExpress.listen(puerto, function () {
    console.log(`Servidor esta corriendo en: http://localhost:${puerto}`);
});