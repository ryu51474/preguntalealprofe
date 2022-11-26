const { Telegraf } = require('telegraf');
const { validate, clean, format, getCheckDigit } = require('rut.js');
const validaRut = (rut)=>{return validate(rut)};
const clever = require("cleverbot-free");
const validadorEmail = require('email-validator');
//const moment = require('moment-timezone');

//modulo propios externos
const {tokenTlgrm} = require('./config');
const { cambioEmail,envioNotas,datosEstudiante,inscripcionAlSistema } = require('./API_servicios/APIservicios');
const BOT_TOKEN = tokenTlgrm();

console.log('cliente inicializado. ya se puede operar')
const menuOpciones=`Estas son las opciones: escribe en palabras tu solicitud segun lo que quieras hacer\n`+
'1.- escribe **opciones** para volver a ver este mensaje.\n'+
'2.- puedes **pedir notas** simplemente escribiéndolo.\n'+
'3.- pideme **cambiar email** para cambiar tu correo para recibir resultados de las pruebas.\n'+
'4.- dime **quiero inscribirme** si no te has incrito al sistema del profesor Daniel.\n'+
'Tambien puedes usar el listado de comandos con el botón MENU\n'+
'👇 aquí'
const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply('Bienvenido, escribe *opciones* para saber lo que puedo hacer.\nEl uso indebido del sistema implica bloqueo, baneo y otras posibles consecuencias'));
bot.help((ctx) => ctx.reply(ctx.from.first_name+'\n'+menuOpciones));
//pruebas de envio de archivo
/* bot.command('informe', (ctx)=>{
  ctx.sendDocument({source:'./informes/informeDeEjemplo.html'})
}) */
bot.on('text', async (ctx)=>{
  const nombreUsuario = ctx.from.first_name;
  const apellidoUsuario = ctx.from.last_name;
  //const usernameUsuario = ctx.from.username;
  const nombreCompletoUsuario = nombreUsuario+' '+apellidoUsuario;
  const mensajeUsuario = ctx.message.text.toLowerCase();
  //console.log(ctx.message.text);
  //analisis del texto y acciones según mensaje
  if(mensajeUsuario.search(/hola/)>=0){//si el mensaje viene con la palabra hola responde un saludo al azar
    var ahora = new Date()//PROCESO PENDIENTE: se ha subido aqui, sacado del primer if porque solo debe responder el bot si es muy tarde
    //var diferenciaHoraria = moment.tz('America/Santiago') //comentado porque la hora de servidor es en UTC y provoca diferencia horaria 
    var arrayRespuestas = [
      `estas bien?, un gusto saludarte ${nombreCompletoUsuario}`,
      `son las ${ahora.getHours()}:${ahora.getMinutes()<10?'0':''}${ahora.getMinutes()} en este momento, en serio me escribes a esta hora ${nombreUsuario}?`,
      `palabras, siempre palabras. por que no me dices de una vez que quieres ${nombreUsuario}?`,
      `${nombreUsuario}, podrias mejorar lo que me dices`,
      `primero el mensaje de saludos, bien ${nombreUsuario}`,
    ];
    var mensajeRespuestaSaludoAzar =
      arrayRespuestas[Math.floor(Math.random() * arrayRespuestas.length)];
    await ctx.reply(mensajeRespuestaSaludoAzar)
    await ctx.reply(`Si deseas saber que puedo hacer por ti puedes escribir **opciones** para saberlo`+
              `\nSi eres profesor sigue las instrucciones de acceso que te dieron`)
    //console.log(mensajeRespuestaSaludoAzar)
  } else if (mensajeUsuario.search(/nota/)>=0){//si en el mensaje existe la palabra nota da instrucciones para recibir notas
    ctx.reply(`${nombreUsuario},  si deseas saber notas debes de ahora ingresar solo tu rut, sin puntos ni guión, en caso de terminar en k reemplácelo con un 1, ej: el rut 12.345.678-k se escribe 123456781. si eres extranjero,  SE INCLUYE EL 100. SI NO LO HACE CORRECTAMENTE SU PETICION SERA ANULADA E IGNORADA (Puede que se responda con cualquier cosa absurda)`)
  } else if (!isNaN(mensajeUsuario)&&validaRut(mensajeUsuario)){
      envioNotas(ctx,nombreCompletoUsuario,mensajeUsuario);
  } else if (mensajeUsuario.normalize("NFD").replace(/[\u0300-\u036f]/g, "").search(/adios/) >= 0||mensajeUsuario.search(/chao/) >= 0) {//despedida con mensaje final
    ctx.reply(
      "Chao. Para mas información visita cuando quieras https://www.profedaniel.cf"
    );
  } else if (mensajeUsuario.search(/email/)>=0){//instrucciones de cambio de email en la base de datos
    //console.log('inicio de envio de  INSTRUCCIONES DE  cambio de email');
    ctx.reply(`${nombreUsuario}, para cambiar tu email en el que recibes las notas debes escribir ahora tu rut sin puntos ni guion seguido de una coma y el nuevo email. SIN ESPACIOS o su solicitud será rechazada. En caso que su rut termine en k reemplácelo por un 1. Si es extranjero no escriba el 100 \n ej: 123456781,nuevocorreo@gmail.com`)
  } else if (mensajeUsuario.search(/opciones/)>=0){//opciones del bot y sus acciones
    ctx.reply(ctx.from.first_name+'\n'+menuOpciones)
  } else if(mensajeUsuario.search(/\/profesor/)==0){//instrucciones especificas para profesor
    ctx.reply(`${nombreUsuario}, para solicitar los datos de algun estudiante `+
                                     `debes usar el comando, un espacio y el rut del estudiante sin puntos ni guión. `+
                                     `En caso de terminar en k, reemplácelo por un 1 en esta forma exactamente por ejemplo:`+
                                     `\n /datos 123456781 `+
                                     `\nSi es rut extranjero NO incluya el 100`)
  } else if(mensajeUsuario.search(/\/datos/)==0){
      datosEstudiante(ctx,nombreCompletoUsuario,mensajeUsuario);
  } else if (mensajeUsuario.search(/inscribirme/)>=0){
    
    await ctx.reply(`${nombreUsuario}, para inscribirse al sistema del profesor debes REEMPLAZAR y ENVIAR los siguientes datos tal como se te indica. NO OLVIDES LAS REGLAS, como por ejemplo el uso correcto de las Mayusculas, no usar tildes, el rut como el ejemplo y NO BORRAR LA COMA al final de cada dato\n O TENDRAS QUE HACERLO DE NUEVO\n`);
    
    setTimeout( async ()=>
     await ctx.reply('***copia y cambia los datos por los tuyos***\n'+
                    '***cuando termines me los envias***\n'+
                    '***👇👇👇👇👇👇👇👇👇👇👇***\n'),3000);
    
    setTimeout( async ()=>
    await ctx.reply('Estudiante,\n'+
              'Primer_Nombre: Alan,\n'+
              '2_Apellidos: Brito Delgado,\n'+
              'RUT: 12345678-5,\n'+
              'numero_de_lista : 3,\n'+
              'correo: correo@ejemplo.com,\n'+
              'curso: 2A,\n'+
              'Direccion: blanco encalada 1250 Talcahuano,\n'+
              'Telefono: +56912345678,\n'+
              'Nombre_y_Apellido_Apoderado: Zoila Vaca,\n'+
              'Telefono_Apoderado: +56987654321'),9000);
  } else if(mensajeUsuario.search(/estudiante,/)==0){//funcion para inscribir alumno nuevo en sistema
    //ctx.reply('datos estudiante' + mensajeUsuario.split(',').length);//linea de pruebas del mensaje
    let apellidosVerificar = mensajeUsuario.split(',')[2].split(':')[1].trim();
    let rutAverificar = mensajeUsuario.split(',')[3].split(':')[1].replace(/\s+/g,'');
    let fono = mensajeUsuario.split(',')[8].split(':')[1].replace(/\s+/g,'');
    let fono_apoderado = mensajeUsuario.split(',')[10].split(':')[1].replace(/\s+/g,'');
    if (apellidosVerificar.split(' ').length>2) {
      ctx.reply('Escribiste '+apellidosVerificar.split(/ /).length+' palabras en tus apellidos')
      return ctx.reply(`${nombreUsuario}, si tus apellidos son compuestos escríbelos como una sola palabra. \nEj: **San Martin** debes escribirlo como **Sanmartin**
                        \nCorrígelo y vuelve a enviarme los datos.
                        \nSi consideras que tu escribiste bien, verifica que no hay dos espacios entre tus dos apellidos`)
    }
    if (fono.length!=12||fono_apoderado.length!=12) {
      return ctx.reply(`${nombreUsuario}, al parecer alguno de los números de teléfono esta incorrecto, verifícalo (no olvides el + antes del 56). si lo necesitas pídele ayuda a tu profesor`)
    }else if(fono===fono_apoderado){
      return ctx.reply(`${nombreUsuario}, no puedes poner el mismo número de teléfono para ti y tu apoderado. Favor corrígelo`)
    }

    if(validaRut(rutAverificar)&&mensajeUsuario.split(',').length==11){
      let resultadoInscripcion=inscripcionAlSistema(mensajeUsuario)
      await ctx.reply(`${nombreUsuario}, por favor revisa cuidadosamente que los datos que me diste estén correctos en el siguiente link y pulsa SIGUIENTE hasta VER Y pulsar ENVIAR para terminar`);
      setTimeout(async()=>await ctx.reply(resultadoInscripcion),6000);
    } else {
      ctx.reply('Te equivocaste en los datos 😔, verifícalos.'+
                '\nVerifica si borraste por error alguna coma o algo de la plantilla que te di que no debías borrar y vuelve a enviármelos'+
                '\nSi tienes dudas pídele ayuda a tu profesor o escribe /online (👈🏾 tócalo si no quieres escribir) para darte ayudarte yo de otra manera en la web mediante google')
    }
    
  } else if (mensajeUsuario.search(/\/online/)==0){
    await ctx.reply(`${nombreUsuario}, accede al siguiente link para inscribirte paso a paso mediante google chat form`)
    setTimeout(async()=>await ctx.reply('https://chat-forms.com/forms/1614949217593-mnk/?form'),3000)//https://chat-forms.com/forms/1614949217593-mnk/?form
  } else if(mensajeUsuario.search(/@/)>=0){
    //se analiza si esta correcto el mensaje
    let rutconEmail = mensajeUsuario.split(',')
    //regex del rut
    let RUT = rutconEmail[0].replace(/[\.,-]/g, '').replace(/[K-k]/g,'1').replace(/\s+/g,'');
    var nuevoEmailalumno = rutconEmail[1].replace(/\s+/g,'')
    if (validadorEmail.validate(nuevoEmailalumno)){
      cambioEmail(ctx,nombreCompletoUsuario,mensajeUsuario);
    } else {ctx.reply(`${nuevoEmailalumno} no es un email valido. reintente`)}
  } else {/**contesta cleverbot */
    clever(mensajeUsuario)
      .then(async (respuestacleverBot) => {
        await //console.log("respuesta cleverbot: " + respuestacleverBot);
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
