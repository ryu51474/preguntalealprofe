const urlApiNotas =
    "https://script.google.com/macros/s/AKfycbyYYD23WAZ2_XBfRBgbeX4R5XqCwbfaPvrYkKQ38Dh7J3oPGKKQqv-3l8m8XxR_OaEKoQ/exec?sdata=";
const urlApiNuevoEmail =
    "https://script.google.com/macros/s/AKfycbyYYD23WAZ2_XBfRBgbeX4R5XqCwbfaPvrYkKQ38Dh7J3oPGKKQqv-3l8m8XxR_OaEKoQ/exec?sdata=";
const urlApiDatosEstudiante =
    "https://script.google.com/macros/s/AKfycbyYYD23WAZ2_XBfRBgbeX4R5XqCwbfaPvrYkKQ38Dh7J3oPGKKQqv-3l8m8XxR_OaEKoQ/exec?sdata=datosEstudiante,";
const urlApiInscripcionEstudiante = 
    "https://docs.google.com/forms/d/e/1FAIpQLSf3HzUYOd3OZikZMSBE1VOG6rgS0PkUOIIlAuEFyXHeM8V40A/viewform?usp=pp_url&entry.2005620554=Alan&entry.691594478=Brito+Delgado+&entry.450021770=123456785&entry.1128966543=99&entry.1045781291=ryu51474@gmail.com&entry.1414220081=2AC25&entry.1065046570=direcci%C3%B3n+de+sauces+5+mz+246+villa+4&entry.1166974658=%2B56999999999&entry.839337160=Zoila+Vaca&entry.2030694607=%2B56888888888"

//const { Telegraf } = require('telegraf');
const fetch = require('isomorphic-fetch');
const fs = require('fs');
var ahora=new Date();

function cambioEmail(ctx,nombreCompletoUsuario,mensajeUsuario){//cambia email del alumno en la BBDD
    console.log('Inicia sistema de cambio de email llamado');
    let respuestaACambioStandard = `${nombreCompletoUsuario}, cambio tu email a ${mensajeUsuario.split(',')[1]} ahora mismo, dame unos segundos para verificar tus datos`;
    ctx.reply(respuestaACambioStandard);
    //proceso de validacion de rut deprecado pues al cambiar email no necesita validar si es un rut valido o no
    //if(cuerpoMensaje.split(',')[0].substring(0,3)=='100') cuerpoMensaje = cuerpoMensaje.split('100')[1];
    fetch(urlApiNuevoEmail+mensajeUsuario)
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
            console.log(respuestaTextodeDireccionEmail)
            ctx.reply(respuestaTextodeDireccionEmail);
          })
          .catch((errorRespuestaDireccionEmail)=>{
            console.log(errorRespuestaDireccionEmail);
          })
      })
      .catch((errorDireccionObtenidaEmail=>{
        console.log(errorDireccionObtenidaEmail)
      }))
}

function envioNotas(ctx,nombreCompletoUsuario,mensajeUsuario){//extrae notas del estudiante en un informe
  //si escribe un numero se toma como un rut y se analiza si se puede sacar las notas
  var RUT = mensajeUsuario.replace(/[\.,-]/g, ""); //no tiene sentido el    .replace(/k/gi,'1')
  if (RUT.substring(0,3)=='100') RUT=RUT.split('100')[1]
  ctx.reply(
    "Espere un momento mientras reviso sus datos."
  );
  fetch(urlApiNotas + RUT)
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
            var nombreArchivomedia = `informe notas de fisica solicitado por ${nombreCompletoUsuario} al ${ahora.getDate()}-${ahora.getMonth()}-${ahora.getFullYear()}.html`;
            var pathFileNombrearchivo = `./informes/${nombreArchivomedia}`;
            //escribo el archivo localmente
              fs.writeFile(
                pathFileNombrearchivo,
                respuestaTextodeDireccion,
                (errorescrituraArchivo) => {
                  console.log(errorescrituraArchivo);
                }
              );
            //envio el archivo del informe dandole un tiempo de espera
            setTimeout(async () => {
              var archivomedia = `./informes/${nombreArchivomedia}`;
              await ctx.sendDocument({source:archivomedia});
              //ahora borro el achivo generado
              await fs.unlinkSync(pathFileNombrearchivo);
            }, 10000);
          } else {
            ctx.reply(
              "Estudiante no existe, verifique los datos y reintente. Si el problema persiste escriba a dcornejo@liceotecnicotalcahuano.cl indicando su rut, nombre y curso"
            );
          }
        })
        .catch((errorDireccionObtenida) => {
          console.log(
            "error de direccion obtenida url porque: " +
              errorDireccionObtenida
          );
        });
    })
    .catch((errorApiNotas) => {
      ctx.reply(numeroEmisor,`Tuve problemas con tu solicitud. por: ${errorApiNotas}. Intente de nuevo, si el problema persiste favor reenvie este mensaje a dcornejo@liceotecnicotalcahuano.cl`)
      console.log("error en la api de notas porque: " + errorApiNotas);
    });
  //cliente.sendMessage(numeroEmisor,apirespuestafinal.toString());  
}

function datosEstudiante(ctx,nombreCompletoUsuario,mensajeUsuario){//extrae los datos de un estudiante desde la BBDD con el rut
  ctx.reply(`${nombreCompletoUsuario}, dame unos segundos para revisar los datos`);
  mensajeUsuario = mensajeUsuario.split(' ')[1]  
  var RUT = mensajeUsuario.replace(/[\.,-]/g, "");
  fetch(urlApiDatosEstudiante+RUT)
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
              await ctx.reply(respuestaDireccionApiDatosEstudiante);
            },5000)
          } else {
            ctx.reply(
              "Estudiante no existe, verifique los datos y reintente. Si el problema persiste escriba a dcornejo@liceotecnicotalcahuano.cl indicando su rut, nombre y curso"
            );
          }
        })
        .catch((errorRespuestaDireccionApiDatosEstudiante)=>{
          console.log(errorRespuestaDireccionApiDatosEstudiante)
        });
    })
    .catch((errorUrlApiDatosEstudiante)=>{
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
  let respuestaDevolver = primer_nombre+' \n'+primer_apellido+' \n'+segundo_apellido+' \n'+rut_nuevo+' \n'+numero_lista+' \n'+correo_nuevo_alumno+' \n'+curso+' \n'+direccion+' \n'+fono+' \n'+apoderado+' \n'+fono_apoderado//'respuesta del server';
  let linkIncripcion = `https://docs.google.com/forms/d/e/1FAIpQLSf3HzUYOd3OZikZMSBE1VOG6rgS0PkUOIIlAuEFyXHeM8V40A/viewform?usp=pp_url&entry.2005620554=${primer_nombre}&entry.691594478=${primer_apellido}+${segundo_apellido}+&entry.450021770=${rut_nuevo}&entry.1128966543=${numero_lista}&entry.1045781291=${correo_nuevo_alumno}&entry.1414220081=${curso}&entry.1065046570=${direccion.replace(/\s+/g,'+')}&entry.1166974658=%2B${fono.split('+')[1]}&entry.839337160=${apoderado.replace(/\s+/g,'+')}&entry.2030694607=%2B${fono_apoderado.split('+')[1]}`
  console.log(linkIncripcion)
  return respuestaDevolver+'\n'+linkIncripcion;
}

//microservicios
function ortografiaMayuscula (texto){
  //return palabra[0].toUpperCase()+palabra.slice(1).toLowerCase()
  return texto.replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase())
}


module.exports={
    cambioEmail,
    envioNotas,
    datosEstudiante,
    inscripcionAlSistema
}
