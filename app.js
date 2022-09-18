const express=require('express');
const appExpress = express();

const puerto = process.env.PORT||3000;

appExpress.get('/',(requerimiento,respuesta)=>{
    respuesta.send('pagina principal en linea. para obtener el qr escriba /qr al final en la barra de direcciones');
});

appExpress.listen(puerto)//,()=>{console.log(`escuchando en http://localhost:${puerto}`)});