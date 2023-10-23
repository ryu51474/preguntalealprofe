require('dotenv').config()
function tokenTlgrm() {
    const tokenProfeDaniel = process.env.BOT_TOKEN // ejemplo '1064387076:AAHJUmOM7g7iwDKynkAeWKKYbLrTPKKBxxx';
    return tokenProfeDaniel.toString();
}

function implementacionApiGoogle(){
    const implementacionApiGoogle = process.env.implementacionApiGoogle // ejemplo 'AKfycbysPjaU_cSu0xPik87OzrmjkZFrTiWoo636w2y6sDMkOouvh0Bn2XBbRT_mGu5_svj2xa';
    return implementacionApiGoogle.toString()
}

function numeroAdmin(){
    const numeroAdmin = process.env.numeroAdmin // ejemplo '56964289006';
    return numeroAdmin.toString();
}

module.exports={
    tokenTlgrm,
    implementacionApiGoogle,
    numeroAdmin
}
