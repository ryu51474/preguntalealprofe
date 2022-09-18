/* const express=require('express');
const appExpress = express();

const puerto = process.env.PORT||3000;

appExpress.get('/',(requerimiento,respuesta)=>{
    respuesta.send('pagina principal en linea. para obtener el qr escriba /qr al final en la barra de direcciones');
});

appExpress.listen(puerto)//,()=>{console.log(`escuchando en http://localhost:${puerto}`)}); */

const express = require('express');

    
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(3000, function () {
    console.log('Server is running: 3000');
});