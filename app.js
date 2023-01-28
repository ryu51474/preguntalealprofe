//seccion Telegram
const { Telegraf } = require('telegraf');
//seccion whatsapp
const { Client, LocalAuth,MessageMedia,Buttons, List } = require("whatsapp-web.js");
const codigoqr = require("qrcode-terminal");

//seccion mixta (telegram y whatsapp)
const { validate, clean, format, getCheckDigit } = require('rut.js');
const validaRut = (rut)=>{return validate(rut)};
const clever = require("cleverbot-free");
const validadorEmail = require('email-validator');
//const moment = require('moment-timezone');

//modulo propios externos
const {tokenTlgrm} = require('./config');
const { cambioEmail,envioNotas,datosEstudiante,inscripcionAlSistema,preguntaleAlProfeAI,sapoderado } = require('./API_servicios/APIservicios');
const BOT_TOKEN = tokenTlgrm();//token telegram

//mensajes constantes de respuesta
const menuOpciones=`Estas son las opciones: escribe en palabras tu solicitud segun lo que quieras hacer\n`+
'1.- Escribe **opciones** para volver a ver este mensaje.\n'+
'2.- Puedes **pedir notas** simplemente escribiéndolo.\n'+
'3.- Pídeme **cambiar email** para cambiar tu correo para recibir resultados de las pruebas.\n'+
'4.- Dime **quiero inscribirme** si no te has inscrito antes al sistema del profesor Daniel.\n'+
'Si quieres algo distinto a lo anterior, lo que quieras de cualquier tema, de tus tareas escolares, curiosidades, etc. , pídemelo directamente (como si fuera gogle)';
const finalMenuOpcionesTelegram='\nTambién puedes usar el listado de comandos con el botón MENU\n'+
'👇 aquí'
const chatFormBotGoogle = 'https://chat-forms.com/forms/1614949217593-mnk/?form'
const complmentoInstruccionesRutNotasEstudiantes=',  si deseas saber notas debes de ahora ingresar solo tu rut, sin puntos ni guión, en caso de terminar en k reemplácelo con un 1, ej: el rut 12.345.678-k se escribe 123456781. si eres extranjero,  SE INCLUYE EL 100. SI NO LO HACE CORRECTAMENTE SU PETICION SERA ANULADA E IGNORADA (Puede que se responda con cualquier cosa absurda)';
const complementoInstruccionesRutDatosEstudianteParaDocentes=', para solicitar los datos de algun estudiante debes usar el comando /datos, un espacio y el rut del estudiante sin puntos ni guión En caso de terminar en k, reemplácelo por un 1 en esta forma exactamente por ejemplo:\n /datos 123456781 \n'+
                                                             'Si es rut extranjero NO incluya e 100\n\n'+
                                                             'Si no conoces el rut del estudiante me es difícil ayudarte, quizás te sirva buscar los datos del apoderado por sus nombres usando el comando /sapoderado (si, tal cual, sapo-derado) seguido de los nombres y apellidos que conozcas del apoderado, si son más, mejor. (ej: /sapoderado Alma Marcela Gozo Ricco)';
const complementoInstruccionesCambioEmail=', para cambiar tu email en el que recibes las notas debes escribir ahora tu rut sin puntos ni guion seguido de una coma y el nuevo email. SIN ESPACIOS o su solicitud será rechazada. En caso que su rut termine en k reemplácelo por un 1. Si es extranjero no escriba el 100 '+
                                          '\n ej: 123456781,nuevocorreo@gmail.com';
const complementoMensajeErrorDatosParaDocentes=', no me mandaste los datos despues del comando /datos. '+
                                                '\nReintenta como se te indicó cuando escribiste /profesor ';
const complementoMensajeUnoInscripcion=', para inscribirse al sistema del profesor debes REEMPLAZAR y ENVIAR los siguientes datos tal como se te indica. NO OLVIDES LAS REGLAS, como por ejemplo el uso correcto de las Mayusculas, no usar tildes, el rut como el ejemplo y NO BORRAR LA COMA al final de cada dato'+
                                        '\nO TENDRAS QUE HACERLO DE NUEVO\n';
const complementoMensajeDosInscripcion='***copia y cambia los datos por los tuyos***\n'+
                                       '***cuando termines me los envias***\n'+
                                       '***👇👇👇👇👇👇👇👇👇👇👇***\n';
const complementoMensajeTresInscripcion = 'Estudiante,\n'+
                                          'Primer_Nombre: Alan,\n'+
                                          '2_Apellidos: Brito Delgado,\n'+
                                          'RUT: 12345678-5,\n'+
                                          'numero_de_lista : 3,\n'+
                                          'correo: correo@ejemplo.com,\n'+
                                          'curso: 2A,\n'+
                                          'Direccion: blanco encalada 1250 Talcahuano,\n'+
                                          'Telefono: +56912345678,\n'+
                                          'Nombre_y_Apellido_Apoderado: Zoila Vaca,\n'+
                                          'Telefono_Apoderado: +56987654321';
const complementoMensajeErrorApellidos= ', si tus apellidos son compuestos escríbelos como una sola palabra. '+
                                        '\nEj: **San Martin** debes escribirlo como **Sanmartin**'+
                                        '\nCorrígelo y vuelve a enviarme los datos.'+
                                        '\nSi consideras que tu escribiste bien, verifica que no hay dos espacios entre tus dos apellidos';
const complementoErrorTelefono = ', al parecer alguno de los números de teléfono esta incorrecto, verifícalo (no olvides el + antes del 56). si lo necesitas pídele ayuda a tu profesor';
const complementoErrorIgualTelefono = ', no puedes poner el mismo número de teléfono para ti y tu apoderado. Favor corrígelo';
const complementoDatosCorrectos = ', por favor revisa cuidadosamente que los datos que me diste estén correctos en el siguiente link y pulsa SIGUIENTE hasta VER Y pulsar ENVIAR para terminar';
const complementoMalaInscripcionUno = 'Te equivocaste en los datos 😔, verifícalos.'+
                                       '\nVerifica si borraste por error alguna coma o algo de la plantilla que te di que no debías borrar y vuelve a enviármelos'+
                                       '\nSi tienes dudas pídele ayuda a tu profesor o escribe /online ';
const complementoMalaInscripcionDos = ' para darte ayudarte yo de otra manera en la web mediante google ';
const complementoMensajeComandoOnline = ', accede al siguiente link para inscribirte paso a paso mediante google chat form '
const mensajeDespedidaConUrlPropia="Chao. Para mas información visita cuando quieras https://www.profedaniel.cf"
const inicioMensajeErrorCleverBot='Por el momento tengo problemas para responder. Escríbeme mas tarde '
//INICIOS DE BOTS
//inicio bot whatsapp
cliente = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});
cliente.on("qr", (qr) => {
  console.log("no habia sesion iniciada");
  codigoqr.generate(qr, { small: true });
  console.log(`se inicia sesion, por favor escanee el qr de arriba o visite http://localhost:${puerto}/qr`);
  /* appExpress.get('/qr',(req,responseweb)=>{
    let qrEnPagina=qrcodeweb.imageSync(qr.toString(),{type:'svg',size:5})
    responseweb.send(qrEnPagina)
  }) */
});
cliente.on("ready", () => {
  console.log("cliente whatsapp inicializado, ya se puede operar");
});
cliente.on("auth_failure", (errorAutenticacion) => {
  console.log("fallo el inicio de sesion en whatsapp porque: ", errorAutenticacion);
});
//inicio bot Telegram
const bot = new Telegraf(BOT_TOKEN);
console.log('cliente telegram inicializado. ya se puede operar')
//comandos basicos botFather telegram
bot.start((ctx) => ctx.reply('Bienvenido, escribe *opciones* para saber lo que puedo hacer.\nEl uso indebido del sistema implica bloqueo, baneo y otras posibles consecuencias'));
bot.help((ctx) => ctx.reply(ctx.from.first_name+'\n'+menuOpciones+finalMenuOpcionesTelegram));

//procesos de anaisis Telegram
bot.on('text', async (ctx)=>{
  const nombreUsuarioTelegram = ctx.from.first_name || " ";
  const apellidoUsuarioTelegram = ctx.from.last_name || " ";
  //const usernameUsuario = ctx.from.username;
  const nombreCompletoUsuarioTelegram = nombreUsuarioTelegram+' '+apellidoUsuarioTelegram;
  const mensajeUsuarioTelegram = ctx.message.text.toLowerCase();
  //console.log(ctx.message.text);
  //analisis del texto y acciones según mensaje
  if(mensajeUsuarioTelegram.search(/hola/)>=0){//si el mensaje viene con la palabra hola responde un saludo al azar
    var ahora = new Date()//PROCESO PENDIENTE: se ha subido aqui, sacado del primer if porque solo debe responder el bot si es muy tarde
    //var diferenciaHoraria = moment.tz('America/Santiago') //comentado porque la hora de servidor es en UTC y provoca diferencia horaria 
    var arrayRespuestas = [
      `estas bien?, un gusto saludarte ${nombreCompletoUsuarioTelegram}`,
      `son las ${ahora.getHours()}:${ahora.getMinutes()<10?'0':''}${ahora.getMinutes()} en este momento, en serio me escribes a esta hora ${nombreUsuarioTelegram}?`,
      `palabras, siempre palabras. por que no me dices de una vez que quieres ${nombreUsuarioTelegram}?`,
      `${nombreUsuarioTelegram}, podrias mejorar lo que me dices`,
      `primero el mensaje de saludos, bien ${nombreUsuarioTelegram}`,
    ];
    var mensajeRespuestaSaludoAzar =
      arrayRespuestas[Math.floor(Math.random() * arrayRespuestas.length)];
    await ctx.reply(mensajeRespuestaSaludoAzar)
    await ctx.reply(`Si deseas saber que puedo hacer por ti puedes escribir **opciones** para saberlo`+
              `\nSi eres profesor sigue las instrucciones de acceso que te dieron`)
    //console.log(mensajeRespuestaSaludoAzar)
  } else if (mensajeUsuarioTelegram.search(/nota/)>=0){//si en el mensaje existe la palabra nota da instrucciones para recibir notas
    ctx.reply(`${nombreUsuarioTelegram}`+complmentoInstruccionesRutNotasEstudiantes)
  } else if (!isNaN(mensajeUsuarioTelegram)&&mensajeUsuarioTelegram.length>=9){
      envioNotas(nombreCompletoUsuarioTelegram,mensajeUsuarioTelegram,null,ctx);
  } else if (mensajeUsuarioTelegram.normalize("NFD").replace(/[\u0300-\u036f]/g, "").search(/adios/) >= 0||mensajeUsuarioTelegram.search(/chao/) >= 0) {//despedida con mensaje final
    ctx.reply(mensajeDespedidaConUrlPropia);
  } else if (mensajeUsuarioTelegram.search(/email/)>=0){//instrucciones de cambio de email en la base de datos
    //console.log('inicio de envio de  INSTRUCCIONES DE  cambio de email');
    ctx.reply(`${nombreUsuarioTelegram}`+complementoInstruccionesCambioEmail);
  } else if (mensajeUsuarioTelegram.search(/opciones/)>=0){//opciones del bot y sus acciones
    ctx.reply(ctx.from.first_name+'\n'+menuOpciones+finalMenuOpcionesTelegram)
  } else if(mensajeUsuarioTelegram.search(/\/docente/)==0){//instrucciones especificas para profesor
    ctx.reply(`Profesor(a) ${nombreUsuarioTelegram}`+complementoInstruccionesRutDatosEstudianteParaDocentes);
  } else if(mensajeUsuarioTelegram.search(/\/datos/)==0){
      if (mensajeUsuarioTelegram.trim()==='/datos') {
        ctx.reply(`Profesor(a) ${nombreCompletoUsuarioTelegram}`+complementoMensajeErrorDatosParaDocentes+'(👈🏾 tócalo si quieres recordar las instrucciones)')
      } else {
        datosEstudiante(nombreCompletoUsuarioTelegram,mensajeUsuarioTelegram,null,ctx);
      }
  } else if (mensajeUsuarioTelegram.search(/inscribirme/)>=0){
    
    await ctx.reply(`${nombreUsuarioTelegram}`+complementoMensajeUnoInscripcion);
    
    setTimeout( async ()=>
     await ctx.reply(complementoMensajeDosInscripcion),3000);
    
    setTimeout( async ()=>
    await ctx.reply(complementoMensajeTresInscripcion),9000);
  } else if(mensajeUsuarioTelegram.search(/estudiante,/)==0){//funcion para inscribir alumno nuevo en sistema
    //ctx.reply('datos estudiante' + mensajeUsuario.split(',').length);//linea de pruebas del mensaje
    let apellidosVerificar = mensajeUsuarioTelegram.split(',')[2].split(':')[1].trim();
    let rutAverificar = mensajeUsuarioTelegram.split(',')[3].split(':')[1].replace(/\s+/g,'');
    let fono = mensajeUsuarioTelegram.split(',')[8].split(':')[1].replace(/\s+/g,'');
    let fono_apoderado = mensajeUsuarioTelegram.split(',')[10].split(':')[1].replace(/\s+/g,'');
    if (apellidosVerificar.split(' ').length>2) {
      ctx.reply('Escribiste '+apellidosVerificar.split(/ /).length+' palabras en tus apellidos')
      return ctx.reply(`${nombreUsuarioTelegram}`+complementoMensajeErrorApellidos)
    }
    if (fono.length!=12||fono_apoderado.length!=12) {
      return ctx.reply(`${nombreUsuarioTelegram}`+complementoErrorTelefono)
    }else if(fono===fono_apoderado){
      return ctx.reply(`${nombreUsuarioTelegram}`+complementoErrorIgualTelefono)
    }

    if(validaRut(rutAverificar)&&mensajeUsuarioTelegram.split(',').length==11){
      let resultadoInscripcion=inscripcionAlSistema(mensajeUsuarioTelegram)
      await ctx.reply(`${nombreUsuarioTelegram}`+complementoDatosCorrectos);
      setTimeout(async()=>await ctx.reply(resultadoInscripcion),6000);
    } else {
      ctx.reply(complementoMalaInscripcionUno+'(👈🏾 tócalo si no quieres escribir)'+complementoMalaInscripcionDos)
    }
    
  } else if (mensajeUsuarioTelegram.search(/\/online/)==0){
    await ctx.reply(`${nombreUsuarioTelegram}`+ complementoMensajeComandoOnline)
    setTimeout(async()=>await ctx.reply(chatFormBotGoogle),3000)//https://chat-forms.com/forms/1614949217593-mnk/?form
  } else if(mensajeUsuarioTelegram.search(/\/sapoderado/)==0){//funcion de busqueda de datos para sapoderados
    ctx.reply('jajaja usaste el comando "sapoderado" 😂');
    if(!mensajeUsuarioTelegram.replace(/\/sapoderado/g,'')){
      ctx.reply('ESCRIBA despues del comando\n"/sapoderado"\n el nombre y apellido de la persona que va a consultar!\n ej: ***/sapoderado Zoila Vaca Gando*** (sin los asteriscos)\n SI TOCA EL COMANDO SOLO SE REPETIRÁ ESTE MENSAJE \nNO SEA ESTÙPIDO');
    } else {
      sapoderado(nombreCompletoUsuarioTelegram,mensajeUsuarioTelegram,null,ctx)
    }
    //sapoderado(nombreCompletoUsuarioTelegram,mensajeUsuarioTelegram,null,ctx);
  } else if(mensajeUsuarioTelegram.search(/@/)>=0){
    //se analiza si esta correcto el mensaje
    let rutconEmail = mensajeUsuarioTelegram.split(',')
    //regex del rut deprecado por ser innecesario para este proceso aqui que no lo ocupo
    //let RUT_paraCambioEmail = rutconEmail[0].replace(/[\.,-]/g, '').replace(/[K-k]/g,'1').replace(/\s+/g,'');
    var nuevoEmailalumno = rutconEmail[1].replace(/\s+/g,'')
    if (validadorEmail.validate(nuevoEmailalumno)){
      cambioEmail(nombreCompletoUsuarioTelegram,mensajeUsuarioTelegram,null,ctx);
    } else {ctx.reply(`${nuevoEmailalumno} no es un email valido. Reintente según instrucciones`)}
  } else {/**contesta open ai de estar disponible y en caso de emergencia cleverbot*/
    try {
      preguntaleAlProfeAI(mensajeUsuarioTelegram)
        .then(async (resultadoRespuestaOpenAI)=>{
          await
          ctx.reply(resultadoRespuestaOpenAI);
          //console.log(resultadoRespuestaOpenAI);
        })
    } catch (error) {
      clever(mensajeUsuarioTelegram)
        .then(async (respuestacleverBot) => {
        await //console.log("respuesta cleverbot: " + respuestacleverBot);
        ctx.reply(respuestacleverBot);
        })
        .catch((errorCleverbot) => {
        //console.log(errorCleverbot);
        ctx.reply(inicioMensajeErrorCleverBot+`${nombreUsuarioTelegram}`);
        })
    }
  }
})

//procesos de analisis Whatsapp
cliente.on("message", async(mensajeEntrante) => {//procesos de respuestas segun mensajes
  let cuerpoMensajeWhatsapp = mensajeEntrante.body.toLowerCase();
  //console.log(mensajeEntrante.body);
  let nombreUsuarioWhatsapp = mensajeEntrante._data.notifyName || " ";
  (nombreUsuarioWhatsapp.toLowerCase().search(/</)>=0)?nombreUsuarioWhatsapp='Estimado estudiante':nombreUsuarioWhatsapp=nombreUsuarioWhatsapp;
  //console.log(nombreRemitente);
  let numeroUsuarioWhatsapp = mensajeEntrante.from;
  //console.log(mensajeEntrante.from);
  //console.log(mensajeEntrante.to);

  
  if (cuerpoMensajeWhatsapp.search(/hola/) >= 0) {//si el mensaje viene con la palabra hola responde un saludo al azar
    var ahora = new Date(); //PROCESO PENDIENTE: se ha subido aqui, sacado del primer if porque solo debe responder el bot si es muy tarde
    var arrayRespuestas = [
      `estas bien?, un gusto saludarte ${nombreUsuarioWhatsapp}`,
      `son las ${ahora.getHours()}:${ahora.getMinutes()<10?'0':''}${ahora.getMinutes()} en este momento, en serio me escribes a esta hora ${nombreUsuarioWhatsapp}?`,
      `palabras, siempre palabras. por que no me dices de una vez que quieres ${nombreUsuarioWhatsapp}?`,
      `${nombreUsuarioWhatsapp}, podrias mejorar lo que me dices`,
      `primero el mensaje de saludos, bien ${nombreUsuarioWhatsapp}`,
    ];
    mensajeRespuestaSaludoAzar =
      arrayRespuestas[Math.floor(Math.random() * arrayRespuestas.length)];
    await cliente.sendMessage(numeroUsuarioWhatsapp, mensajeRespuestaSaludoAzar);
    await cliente.sendMessage(numeroUsuarioWhatsapp,`Si deseas saber que puedo hacer por ti puedes escribir **opciones** para saberlo.`+
                                      `\n Si eres profesor sigue las instrucciones de acceso que te dieron`)
  } else if (cuerpoMensajeWhatsapp.search(/nota/) >= 0) {//si en el mensaje existe la palabra nota da instrucciones para recibir notas
    cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complmentoInstruccionesRutNotasEstudiantes);
  } else if (!isNaN(cuerpoMensajeWhatsapp)&&cuerpoMensajeWhatsapp.length>=9) {//envio de notas usando solo el rut
    envioNotas(nombreUsuarioWhatsapp,cuerpoMensajeWhatsapp,numeroUsuarioWhatsapp,null);
  } else if (cuerpoMensajeWhatsapp.normalize("NFD").replace(/[\u0300-\u036f]/g, "").search(/adios/) >= 0||cuerpoMensajeWhatsapp.search(/chao/) >= 0) {//despedida con mensaje final
    mensajeEntrante.reply(mensajeDespedidaConUrlPropia);
  } else if (cuerpoMensajeWhatsapp.search(/email/)>=0){//instrucciones de cambio de email en la base de datos
    //console.log('inicio de envio de  INSTRUCCIONES DE  cambio de email');
    cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complementoInstruccionesCambioEmail)
  } else if (cuerpoMensajeWhatsapp.search(/opciones/)>=0){//opciones del bot y sus acciones
    cliente.sendMessage(numeroUsuarioWhatsapp,nombreUsuarioWhatsapp+'\n'+menuOpciones)
  } else if(cuerpoMensajeWhatsapp.search(/\/docente/)>=0){
    cliente.sendMessage(numeroUsuarioWhatsapp,`Profesor(a) ${nombreUsuarioWhatsapp}`+complementoInstruccionesRutDatosEstudianteParaDocentes)
  } else if(cuerpoMensajeWhatsapp.search(/\/datos/)>=0){
      if (cuerpoMensajeWhatsapp.trim()==='/datos'){
        cliente.sendMessage(numeroUsuarioWhatsapp,
          `Profesor(a) ${nombreUsuarioWhatsapp}`+complementoMensajeErrorDatosParaDocentes+'(👈🏾 vuelve a escribirlo así si quieres recordar las instrucciones)');
      } else{      
        datosEstudiante(nombreUsuarioWhatsapp,cuerpoMensajeWhatsapp,numeroUsuarioWhatsapp,null);
      }
  } else if (cuerpoMensajeWhatsapp.search(/inscribirme/)>=0){
    
    await cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complementoMensajeUnoInscripcion);
    
    setTimeout( async ()=>
     await cliente.sendMessage(numeroUsuarioWhatsapp,complementoMensajeDosInscripcion),3000);
    
    setTimeout( async ()=>
    await cliente.sendMessage(numeroUsuarioWhatsapp,complementoMensajeTresInscripcion),9000);
  } else if(cuerpoMensajeWhatsapp.search(/estudiante,/)==0){//funcion para inscribir alumno nuevo en sistema
    //ctx.reply('datos estudiante' + mensajeUsuario.split(',').length);//linea de pruebas del mensaje
    //cliente.sendMessage(numeroUsuarioWhatsapp,'datos estudiante' + mensajeUsuario.split(',').length);//linea de pruebas del mensaje
    let apellidosVerificar = cuerpoMensajeWhatsapp.split(',')[2].split(':')[1].trim();
    let rutAverificar = cuerpoMensajeWhatsapp.split(',')[3].split(':')[1].replace(/\s+/g,'');
    let fono = cuerpoMensajeWhatsapp.split(',')[8].split(':')[1].replace(/\s+/g,'');
    let fono_apoderado = cuerpoMensajeWhatsapp.split(',')[10].split(':')[1].replace(/\s+/g,'');
    if (apellidosVerificar.split(' ').length>2) {
      cliente.sendMessage(numeroUsuarioWhatsapp,'Escribiste '+apellidosVerificar.split(/ /).length+' palabras en tus apellidos')
      return cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complementoMensajeErrorApellidos)
    }
    if (fono.length!=12||fono_apoderado.length!=12) {
      return cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complementoErrorTelefono)
    }else if(fono===fono_apoderado){
      return cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complementoErrorIgualTelefono)
    }

    if(validaRut(rutAverificar)&&cuerpoMensajeWhatsapp.split(',').length==11){
      let resultadoInscripcion=inscripcionAlSistema(cuerpoMensajeWhatsapp)
      await cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complementoDatosCorrectos);
      setTimeout(async()=>await cliente.sendMessage(numeroUsuarioWhatsapp,resultadoInscripcion),6000);
    } else {
      cliente.sendMessage(numeroUsuarioWhatsapp,complementoMalaInscripcionUno+'(👈🏾 exactamente de esa forma con la barra inclinada junta)'+complementoMalaInscripcionDos)
    }
    
  } else if (cuerpoMensajeWhatsapp.search(/\/online/)==0){
    await cliente.sendMessage(numeroUsuarioWhatsapp,`${nombreUsuarioWhatsapp}`+complementoMensajeComandoOnline)
    setTimeout(async()=>await cliente.sendMessage(numeroUsuarioWhatsapp,chatFormBotGoogle),3000)//https://chat-forms.com/forms/1614949217593-mnk/?form
  } else if(cuerpoMensajeWhatsapp.search(/@/)>=0){
    //se analiza si esta correcto el mensaje
    let rutconEmail = cuerpoMensajeWhatsapp.split(',')
    //regex del rut deprecado por ser innecesario para este proceso aqui que no lo ocupo
    //let RUT_paraCambioEmail = rutconEmail[0].replace(/[\.,-]/g, '').replace(/[K-k]/g,'1').replace(/\s+/g,'');
    var nuevoEmailalumno = rutconEmail[1].replace(" ","")
    //console.log(nuevoEmailalumno);
    if (validadorEmail.validate(nuevoEmailalumno)){
      //console.log(`${nuevoEmailalumno} es un email valido`);
      cambioEmail(nombreUsuarioWhatsapp,cuerpoMensajeWhatsapp,numeroUsuarioWhatsapp,null);
    } else {cliente.sendMessage(numeroUsuarioWhatsapp,`${nuevoEmailalumno} no es un email valido. Reintente según instrucciones`)}
  } else {/**contesta open ai de estar disponible y en caso de emergencia cleverbot*/
    try {
      preguntaleAlProfeAI(cuerpoMensajeWhatsapp)
        .then(async (resultadoRespuestaOpenAI)=>{
          await
          cliente.sendMessage(numeroUsuarioWhatsapp,resultadoRespuestaOpenAI.replace(/\n\n/g,''));
        })
    } catch (error) {
      clever(cuerpoMensajeWhatsapp)
        .then(async (respuestacleverBot) => {
          await //console.log("respuesta cleverbot: " + respuestacleverBot);
          cliente.sendMessage(numeroUsuarioWhatsapp, respuestacleverBot);
        })
        .catch((errorCleverbot) => {
          //console.log(errorCleverbot);
          cliente.sendMessage(numeroUsuarioWhatsapp, inicioMensajeErrorCleverBot+`${nombreUsuarioWhatsapp}`);
        })
    }
  }
});




//para otro tipo de mensajes de telegram
bot.on('sticker', (ctx) => ctx.reply('👍'));
//bot.hears(['Hola','hola'], (ctx) => ctx.reply('Hey, que tal '+ ctx.from.first_name+' escribe **opciones** para saber lo que puedo hacer'));

//ACTIVACION INICIAL BOTS
cliente.initialize();
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
