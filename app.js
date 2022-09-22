const { Telegraf } = require('telegraf');
const { validate, clean, format, getCheckDigit } = require('rut.js');
const validaRut = (rut)=>{return validate(rut)};
const clever = require("cleverbot-free");
const validadorEmail = require('email-validator');

//modulo propios externos
const {tokenTlgrm} = require('./config');
const { envioNotas } = require('./API_servicios/APIservicios');
const BOT_TOKEN = tokenTlgrm();
//const {cambioEmail,envioNotas} = require('./API_servicios/APIservicios');

var ahora = new Date(); //PROCESO PENDIENTE: se ha subido aqui, sacado del primer if porque solo debe responder el bot si es muy tarde
console.log('cliente inicializado. ya se puede operar')
const menuOpciones=`Estas son las opciones: escribe en palabras tu solicitud segun lo que quieras hacer\n`+
'1.- escribe **opciones** para volver a ver este mensaje\n'+
'2.- puedes **pedir notas** simplemente escribiéndolo\n'+
'3.- pideme **cambiar email** para cambiar tu correo para recibir resultados de las pruebas\n'+
'Tambien puedes usar el listado de comandos con el boton verde MENU\n'+
'👇 aquí'
const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply('Bienvenido, escribe opciones para saber lo que puedo hacer.\nEl uso indebido del sistema implica bloqueo, baneo y otras posibles consecuencias'));
bot.help((ctx) => ctx.reply(ctx.from.first_name+'\n'+menuOpciones));
//pruebas de envio de archivo
/* bot.command('informe', (ctx)=>{
  ctx.sendDocument({source:'./informes/informeDeEjemplo.html'})
}) */
bot.on('text', (ctx)=>{
  const nombreUsuario = ctx.from.first_name;
  const apellidoUsuario = ctx.from.last_name;
  const usernameUsuario = ctx.from.username;
  const nombreCompletoUsuario = nombreUsuario+' '+apellidoUsuario;
  const mensajeUsuario = ctx.message.text.toLowerCase();
  console.log(ctx.message.text);
  console.log(nombreUsuario + ' '+ apellidoUsuario+ ' de usuario '+ usernameUsuario+' dijo: '+ mensajeUsuario)
  //analisis del texto y acciones según mensaje
  if(mensajeUsuario.search(/hola/)>=0){//si el mensaje viene con la palabra hola responde un saludo al azar
    var arrayRespuestas = [
      `estas bien?, un gusto saludarte ${nombreCompletoUsuario}`,
      `son las ${ahora.getHours()}:${ahora.getMinutes()} en este momento, en serio me escribes a esta hora ${nombreUsuario}?`,
      `palabras, siempre palabras. por que no me dices de una vez que quieres ${nombreUsuario}?`,
      `${nombreUsuario}, podrias mejorar lo que me dices`,
      `primero el mensaje de saludos, bien ${nombreUsuario}`,
    ];
    var mensajeRespuestaSaludoAzar =
      arrayRespuestas[Math.floor(Math.random() * arrayRespuestas.length)];
    ctx.reply(mensajeRespuestaSaludoAzar)
    ctx.reply(`Si deseas saber que puedo hacer por ti puedes escribir **opciones** para saberlo`)
    console.log(mensajeRespuestaSaludoAzar)
  } else if (mensajeUsuario.search(/nota/)>=0){//si en el mensaje existe la palabra nota da instrucciones para recibir notas
    ctx.reply(`${nombreUsuario},  si deseas saber notas debes de ahora ingresar solo tu rut, sin puntos ni guión, en caso de terminar en k reemplácelo con un 1, ej: el rut 12.345.678-k se escribe 123456781. si eres extranjero, no escribas el 100. SI NO LO HACE CORRECTAMENTE SU PETICION SERA ANULADA E IGNORADA (Puede que se responda con cualquier cosa absurda)`)
  } else if (!isNaN(mensajeUsuario)&&validaRut(mensajeUsuario)){
      envioNotas(ctx,nombreCompletoUsuario,mensajeUsuario);
  } else if (mensajeUsuario.normalize("NFD").replace(/[\u0300-\u036f]/g, "").search(/adios/) >= 0||mensajeUsuario.search(/chao/) >= 0) {//despedida con mensaje final
    ctx.reply(
      "Chao. Para mas información visita cuando quieras https://www.profedaniel.cf"
    );
  } else if (mensajeUsuario.search(/email/)>=0){//instrucciones de cambio de email en la base de datos
    console.log('inicio de envio de  INSTRUCCIONES DE  cambio de email');
    ctx.reply(`${nombreUsuario}, para cambiar tu email en el que recibes las notas debes escribir ahora tu rut sin puntos ni guion seguido de una coma y el nuevo email. SIN ESPACIOS o su solicitud será rechazada. En caso que su rut termine en k reemplácelo por un 1. Si es extranjero no escriba el 100 \n ej: 123456781,nuevocorreo@gmail.com`)
  } else if(mensajeUsuario.search(/@/)>=0){
    //se analiza si esta correcto el mensaje
    let rutconEmail = mensajeUsuario.split(',')
    //regex del rut
    let RUT = rutconEmail[0].replace(/[\.,-]/g, "");
    console.log(RUT);
    var nuevoEmailalumno = rutconEmail[1].replace(" ","")
    console.log(nuevoEmailalumno);
    if (validadorEmail.validate(nuevoEmailalumno)){
      console.log(`${nuevoEmailalumno} es un email valido`);
      cambioEmail(ctx,nombreCompletoUsuario,mensajeUsuario);
    } else {ctx.reply(`${nuevoEmailalumno} no es un email valido. reintente`)}
  } else if (mensajeUsuario.search(/opciones/)>=0){//opciones del bot y sus acciones
    ctx.reply(ctx.from.first_name+'\n'+menuOpciones)
  } else {/**contesta cleverbot */
    clever(mensajeUsuario)
      .then(async (respuestacleverBot) => {
        await console.log("respuesta cleverbot: " + respuestacleverBot);
        ctx.reply(respuestacleverBot);
      })
      .catch((errorCleverbot) => {
        console.log(errorCleverbot);
        ctx.reply(
          `Por el momento tengo problemas para responder. escribeme mas tarde ${nombreNotificacion}`
        );
      });
  }
})


//para otro tipo de mensajes
bot.on('sticker', (ctx) => ctx.reply('👍'));
//bot.hears(['Hola','hola'], (ctx) => ctx.reply('Hey, que tal '+ ctx.from.first_name+' escribe **opciones** para saber lo que puedo hacer'));
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
