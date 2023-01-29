require('dotenv').config()
const axios = require('axios')

const urlApiNotas =
    "https://script.google.com/macros/s/AKfycbyYYD23WAZ2_XBfRBgbeX4R5XqCwbfaPvrYkKQ38Dh7J3oPGKKQqv-3l8m8XxR_OaEKoQ/exec?sdata=";
const urlApiNuevoEmail =
    "https://script.google.com/macros/s/AKfycbyYYD23WAZ2_XBfRBgbeX4R5XqCwbfaPvrYkKQ38Dh7J3oPGKKQqv-3l8m8XxR_OaEKoQ/exec?sdata=";
const urlApiDatosEstudiante =
    "https://script.google.com/macros/s/AKfycbyYYD23WAZ2_XBfRBgbeX4R5XqCwbfaPvrYkKQ38Dh7J3oPGKKQqv-3l8m8XxR_OaEKoQ/exec?sdata=datosEstudiante,";
const numeroAdmin=process.env.numeroAdmin//ejemplo '56964289005';
const urlApiRutificadorRut =
    "https://rutificador.porsilapongo.cl/api/v1/persona/rut/"//https://rutificador.porsilapongo.cl/api/v1/persona/rut/{rut}
const urlApiRutificadorNombre =
    "https://rutificador.porsilapongo.cl/api/v1/persona/buscar/"//https://rutificador.porsilapongo.cl/api/v1/persona/buscar/{nombre}


//la const de aquí abajo se usa como modelo y no se puede usar como const por variables intermedias
//const urlApiInscripcionEstudiante = "https://docs.google.com/forms/d/e/1FAIpQLSf3HzUYOd3OZikZMSBE1VOG6rgS0PkUOIIlAuEFyXHeM8V40A/viewform?usp=pp_url&entry.2005620554=Alan&entry.691594478=Brito+Delgado+&entry.450021770=123456785&entry.1128966543=99&entry.1045781291=ryu51474@gmail.com&entry.1414220081=2AC25&entry.1065046570=direcci%C3%B3n+de+sauces+5+mz+246+villa+4&entry.1166974658=%2B56999999999&entry.839337160=Zoila+Vaca&entry.2030694607=%2B56888888888"

// seccion openAI
const { Configuration, OpenAIApi } = require("openai");
const configuracionAI = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuracionAI);

//seccion telegram
const fetch = require('isomorphic-fetch');
const fs = require('fs');
var ahora=new Date();

//seccion whatsapp
const {MessageMedia} = require('whatsapp-web.js');
const { Context } = require('telegraf');

//funciones de proceso en la webapi de google sheets
function envioNotas(nombreCompletoUsuario,mensajeUsuario,numeroUsuarioWhatsapp,ctx){//extrae notas del estudiante en un informe
  //si escribe un numero se toma como un rut y se analiza si se puede sacar las notas
  let RUT_solicitar_notas = mensajeUsuario.trim(); //no tiene sentido el    .replace(/k/gi,'1') y todo replace porque se pide el rut sin errores
  if (RUT_solicitar_notas.substring(0,3)=='100') RUT_solicitar_notas=RUT_solicitar_notas.split('100')[1];
  let respuestaEnvioNotasStandard= `${nombreCompletoUsuario}, espera un momento mientras reviso los datos.`;
  try { //difiere si el mensaje es desde telegram o whatsapp
    ctx.reply(respuestaEnvioNotasStandard);   
  } catch (errorEnviarNotas) {
    cliente.sendMessage(numeroUsuarioWhatsapp,respuestaEnvioNotasStandard);
  }
  fetch(urlApiNotas + RUT_solicitar_notas)
    .then((respuestaApiNotas) => {
      return respuestaApiNotas;
    })
    .then((direccionObtenida) => {
      fetch(direccionObtenida.url)
        .then((respuestadeDireccion) => {
          return respuestadeDireccion.text();
        })
        .then((respuestaTextodeDireccion) => {
          //recibo el string html
          if (
            respuestaTextodeDireccion != "Estudiante no existe, reintente"
          ) {
            let nombreArchivomedia = `informe notas de fisica solicitado por ${nombreCompletoUsuario} al ${ahora.getDate()}_${ahora.getMonth()+1}_${ahora.getFullYear()}.html`;
            let pathFileNombrearchivo = `./informes/${nombreArchivomedia}`;
            //escribo el archivo localmente
            new MessageMedia(//este acto es solo para whatsapp, telegram no lo necesita
              fs.writeFile(
                pathFileNombrearchivo,
                respuestaTextodeDireccion,
                (errorescrituraArchivo) => {
                  if(errorescrituraArchivo!=null){
                    console.log(errorescrituraArchivo);
                  }
                }
              )
            );
            //envio el archivo del informe dandole un tiempo de espera
            setTimeout(async () => {
              var archivomediaTlgrm = `./informes/${nombreArchivomedia}`;
              var archivomediaWsp = MessageMedia.fromFilePath(archivomediaTlgrm)
              try {
                await ctx.sendDocument({source:archivomediaTlgrm});
              } catch (error) {
                await cliente.sendMessage(numeroUsuarioWhatsapp,archivomediaWsp)
              }
              
              //ahora borro el achivo generado
              await fs.unlinkSync(pathFileNombrearchivo);
            }, 10000);
          } else {
            try {
              ctx.reply(
                "Estudiante no existe, verifique los datos y reintente. Si el problema persiste escriba a dcornejo@liceotecnicotalcahuano.cl indicando su rut, nombre y curso"
              );
            } catch (error) {
              cliente.sendMessage(
                numeroUsuarioWhatsapp,
                "Estudiante no existe, verifique los datos y reintente. Si el problema persiste escriba a dcornejo@liceotecnicotalcahuano.cl indicando su rut, nombre y curso"
              );
            }
            
          }
        })
        .catch((errorDireccionObtenida) => {
          let mensajeErrorDireccionObtenida="error de direccion obtenida url porque: " +
          errorDireccionObtenida
          console.log(mensajeErrorDireccionObtenida);
          cliente.sendMessage(numeroAdmin,mensajeErrorDireccionObtenida+'\n'+'Peticion de Notas de '+nombreCompletoUsuario)
        });
    })
    .catch((errorApiNotas) => {
      try {
        ctx.reply(`Tuve problemas con tu solicitud. por: ${errorApiNotas}. Intente de nuevo, si el problema persiste favor reenvie este mensaje a dcornejo@liceotecnicotalcahuano.cl`)
      } catch (error) {
        cliente.sendMessage(numeroAdmin,`Tuve problemas con la solicitud de notas de ${nombreCompletoUsuario} cuando pidio por el rut ${RUT_solicitar_notas} por: ${errorApiNotas}.`)
      }
      //console.log("error en la api de notas porque: " + errorApiNotas);
    });
}

function datosEstudiante(nombreCompletoUsuario,mensajeUsuario,numeroUsuarioWhatsapp,ctx){//extrae los datos de un estudiante desde la BBDD con el rut
  let respuestaDatosEstudianteStandard=`Profesor(a) ${nombreCompletoUsuario}, deme unos segundos para revisar los datos que me dio`
  try {//difiere si el mensaje es desde telegram o whatsapp
    ctx.reply(respuestaDatosEstudianteStandard);
  } catch (errorSolicitudDatosEstudiante) {
    cliente.sendMessage(numeroUsuarioWhatsapp,respuestaDatosEstudianteStandard);
  }
  mensajeUsuario = mensajeUsuario.split(' ')[1]  
  let RUT_solicitar_datos = mensajeUsuario.replace(/[\.,-]/g, "").replace(/[K-k]/g,'1').trim();
  fetch(urlApiDatosEstudiante+RUT_solicitar_datos)
    .then((direccionRespuestaApiDatosEstudiante)=>{
        return direccionRespuestaApiDatosEstudiante;
    })
    .then((direccionRespuestaApiDatosEstudiante)=>{
      fetch(direccionRespuestaApiDatosEstudiante.url)
        .then((respuestaDireccionApiDatosEstudiante)=>{
          return respuestaDireccionApiDatosEstudiante.text();
        })
        .then((respuestaDireccionApiDatosEstudiante)=>{
          //recibo el string
          if(
            respuestaDireccionApiDatosEstudiante!=="Estudiante no existe, reintente"
          ){
            //console.log(respuestaDireccionApiDatosEstudiante);
            setTimeout(async ()=>{
              try {
                await ctx.reply(respuestaDireccionApiDatosEstudiante);
              } catch (error) {
                await cliente.sendMessage(numeroUsuarioWhatsapp,respuestaDireccionApiDatosEstudiante);
              }
            },5000)
          } else {
            try {
              ctx.reply(
                "Estudiante no existe, verifique los datos y reintente. Si el problema persiste escriba a dcornejo@liceotecnicotalcahuano.cl indicando su rut, nombre y curso"
              );
            } catch (error) {
              cliente.sendMessage(
                numeroUsuarioWhatsapp,
                "Estudiante no existe, verifique los datos y reintente. Si el problema persiste escriba a dcornejo@liceotecnicotalcahuano.cl indicando su rut, nombre y curso"
              );
            }
          }
        })
        .catch((errorRespuestaDireccionApiDatosEstudiante)=>{
          cliente.sendMessage(numeroAdmin,`Error respuesta direccion api datos estudiante en la solicitud de datos de ${nombreCompletoUsuario} cuando pidio los datos del estudiante ${RUT_solicitar_datos} por : ${errorRespuestaDireccionApiDatosEstudiante}`)
          console.log(errorRespuestaDireccionApiDatosEstudiante)
        });
    })
    .catch((errorUrlApiDatosEstudiante)=>{
      cliente.sendMessage(numeroAdmin,`Error en la url Api Datos Estudiante cuando pidio ${nombreCompletoUsuario} por el rut ${RUT_solicitar_datos} por: ${errorUrlApiDatosEstudiante}`)
      console.log(`Error en urlApiDatosEstudiante por: ${errorUrlApiDatosEstudiante}`);
    })
}

function inscripcionAlSistema(mensajeUsuario) {//inscribe al alumno al sistema de la BBDD
  //se extraen los datos de la plantilla
  let datos_inscripcion=mensajeUsuario.split(',');
  let primer_nombre=ortografiaMayuscula(datos_inscripcion[1].split(':')[1].trim());
  let dos_apellidos=datos_inscripcion[2].split(':')[1].trim()//eliminaEspaciosInicialesFinales(datos_inscripcion[2].split(':')[1]);
  let primer_apellido=ortografiaMayuscula(dos_apellidos.split(' ')[0]);
  let segundo_apellido=ortografiaMayuscula(dos_apellidos.split(' ')[1]);
  let rut_nuevo = datos_inscripcion[3].split(':')[1].replace(/[\.,-]/g, '').replace(/[K-k]/g,'1').replace(/\s+/g,'').replace(/^100/,'');
  let numero_lista = datos_inscripcion[4].split(':')[1].trim();
  let correo_nuevo_alumno = datos_inscripcion[5].split(':')[1].trim();
  let curso = datos_inscripcion[6].split(':')[1].replace(/\s+/g,'').toUpperCase() + 'C25';
  let direccion = datos_inscripcion[7].split(':')[1].replace(/^ /,'').trimStart();
  let fono = datos_inscripcion[8].split(':')[1].replace(/\s+/g,'');
  let apoderado = ortografiaMayuscula(datos_inscripcion[9].split(':')[1].trim());
  let fono_apoderado = datos_inscripcion[10].split(':')[1].replace(/\s+/g,'');
  let linkIncripcion = `https://docs.google.com/forms/d/e/1FAIpQLSf3HzUYOd3OZikZMSBE1VOG6rgS0PkUOIIlAuEFyXHeM8V40A/viewform?usp=pp_url&entry.2005620554=${primer_nombre}&entry.691594478=${primer_apellido}+${segundo_apellido}+&entry.450021770=${rut_nuevo}&entry.1128966543=${numero_lista}&entry.1045781291=${correo_nuevo_alumno}&entry.1414220081=${curso}&entry.1065046570=${direccion.replace(/\s+/g,'+')}&entry.1166974658=%2B${fono.split('+')[1]}&entry.839337160=${apoderado.replace(/\s+/g,'+')}&entry.2030694607=%2B${fono_apoderado.split('+')[1]}`
  return linkIncripcion;
}

function cambioEmail(nombreCompletoUsuario,mensajeUsuario,numeroUsuarioWhatsapp,ctx){//cambia email del alumno en la BBDD
  //console.log('Inicia sistema de cambio de email llamado');
  let respuestaACambioStandard = `${nombreCompletoUsuario}, cambio tu email a ${mensajeUsuario.split(',')[1]} ahora mismo, dame unos segundos para verificar tus datos`;
  try {//difiere si el mensaje es desde telegram o whatsapp
    ctx.reply(respuestaACambioStandard);
  } catch (errorCambioEmail) {
    cliente.sendMessage(numeroUsuarioWhatsapp,respuestaACambioStandard);
  }
  //regex del rut
  let rutconEmail = mensajeUsuario.split(',')
  let RUT_paraCambioEmail = rutconEmail[0].replace(/[\.,-]/g, '').replace(/[K-k]/g,'1').replace(/\s+/g,'').trim();
  let correo_paraCambioEmail = rutconEmail.replace(/\s+/g,'').trim();
  let comandoListoparaAPI = RUT_paraCambioEmail+','+correo_paraCambioEmail;
  //if(cuerpoMensaje.split(',')[0].substring(0,3)=='100') cuerpoMensaje = cuerpoMensaje.split('100')[1];
  fetch(urlApiNuevoEmail+comandoListoparaAPI)
    .then((respuestaApiEmail)=>{
      return respuestaApiEmail;
    })
    .then((direccionObtenidaEmail)=>{
      fetch(direccionObtenidaEmail.url)
        .then((respuestarDireccionEmail)=>{
          return respuestarDireccionEmail.text();
        })
        .then((respuestaTextodeDireccionEmail)=>{
          //recibo el string
          //console.log(respuestaTextodeDireccionEmail)
          try {
            ctx.reply(respuestaTextodeDireccionEmail);
          } catch (error) {
            cliente.sendMessage(numeroUsuarioWhatsapp,respuestaTextodeDireccionEmail);
          }
        })
        .catch((errorRespuestaDireccionEmail)=>{
          console.log(errorRespuestaDireccionEmail);
          cliente.sendMessage(numeroAdmin,`Hubo un error en la respuesta de la direccion email cuando se quiso cambiar los datos de ${nombreCompletoUsuario} con rut ${RUT_paraCambioEmail} por: ${errorRespuestaDireccionEmail}`)
        })
    })
    .catch((errorDireccionObtenidaEmail=>{
      console.log(errorDireccionObtenidaEmail);
      cliente.sendMessage(numeroAdmin,`Hubo un error en la respuesta de la direccion obtenida email cuando se quiso cambiar los datos de ${nombreCompletoUsuario} con rut ${RUT_paraCambioEmail} por: ${errorDireccionObtenidaEmail}`);
    }))
}

//microservicios
function ortografiaMayuscula (texto){//corrige palabras dandole mayuscula a la primera letra de cada una
  //return palabra[0].toUpperCase()+palabra.slice(1).toLowerCase()
  return texto.replace(/(^\w{1})|(\s+\w{1})/g, primeraLetra => primeraLetra.toUpperCase())
}

async function preguntaleAlProfeAI(mensajeConsulta) {//Consulta inteligente gracias a openai
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: mensajeConsulta,//ejemplo:"cuantos años tienes",
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  respuestaInteligente=response.data.choices[0].text;
  //console.log(respuestaInteligente);//despues de pruebas comentar esta linea
  return respuestaInteligente;
}

function sapoderado(nombreCompletoUsuario,mensajeUsuario,numeroUsuarioWhatsapp,ctx) {//consulta datos de apoderados segun servicio api rutificador de porsilapongo.cl (gracias al creador, te pasaste con el nombre de la API jaja)
  let respuestaSapoderadoEstandard= `Profesor(a) ${nombreCompletoUsuario}, deme unos segundos para revisar los nombres que me dio del apoderado: `;
  let nombresConsultadosApoderado= mensajeUsuario.replace(/\/sapoderado /g,''); //filtra el mensaje dejando solo las palabras con el nombre
  let nombreParaDirUrlRutificadorNombre = nombresConsultadosApoderado.replace(' ','%20').trim();
  try {//difiere si el mensaje es desde telegram o whatsapp
    ctx.reply(respuestaSapoderadoEstandard+ortografiaMayuscula(nombresConsultadosApoderado));
    //ctx.reply(urlApiRutificadorNombre+nombreParaDirUrlRutificadorNombre);
  } catch (errorSolicitudDatosEstudiante) {
    cliente.sendMessage(numeroUsuarioWhatsapp,respuestaSapoderadoEstandard+nombresConsultadosApoderado);
    //cliente.sendMessage(urlApiRutificadorNombre+nombreParaDirUrlRutificadorNombre)
  }
  axios.get(urlApiRutificadorNombre+nombreParaDirUrlRutificadorNombre)
    .then((respuestaurlRutificadorNombreConAxios)=>{
      let datosUtiles=respuestaurlRutificadorNombreConAxios.data;
      let respuestaApiRutificadorStandard ='Profesor(a), segun lo consultado tuve estos resultados:\n\n'
      try {//diferencia entre usuario telegram y whatsapp
        ctx.reply(respuestaApiRutificadorStandard)
      } catch (error) {
        cliente.sendMessage(numeroUsuarioWhatsapp,respuestaApiRutificadorStandard)
      }
      datosUtiles.forEach(element => {
        try {
          ctx.reply(JSON.stringify(element));
        } catch (error) {
          cliente.sendMessage(numeroUsuarioWhatsapp,JSON.stringify(element))
        }
      });
    })
}


module.exports={
    cambioEmail,
    envioNotas,
    datosEstudiante,
    inscripcionAlSistema,
    preguntaleAlProfeAI,
    sapoderado
}
