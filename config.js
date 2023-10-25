require('dotenv').config()
function tokenTlgrm() {
    const tokenProfeDaniel = process.env.BOT_TOKEN // ejemplo '1064387076:AAHJUmOM7g7iwDKynkAeWKKYbLrTPKKBxxx';
    return tokenProfeDaniel.toString();
}


module.exports={
    tokenTlgrm
}
