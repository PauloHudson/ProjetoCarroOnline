// espress, mongoose, bodyparser, json, http.
const express = require('express');
const path = require("path")
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

let app = express();
//configurar bodyparser
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json())

// estático
app.use(express.static(__dirname + '/Public'));

// Ler os arquivos EJS...
app.set("views", path.join(__dirname, 'View'))
app.set('view engine', 'ejs')

// Routes
app.get('/', (req,res)=>{
    res.render('login.ejs')
})
app.get('/register', (req,res)=>{
    res.render('register.ejs')
})
app.get('/add', (req,res)=>{
    res.sendFile(__dirname + "/Public/Add.html")
})
app.get('/remove', (req,res)=>{
    res.sendFile(__dirname + '/Public/Remove.html')
})
app.get('/update', (req,res)=>{
    res.sendFile(__dirname + '/Public/Update.html')
})

//Conectar ao Mongo

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log("Conectado ao MONGO")
    })
    .catch((error)=>{
        console.log("Error ao conectar", error)
    })
// 
// 
//  CADASTROOOOOOO
// 
//criar schema para mandar ao banco de dados...
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})
//cria um novo modelo dentro do mongoose com o nome ids. 
const user = mongoose.model('ids', UserSchema)
// 
app.post('/cadastrar', async(req,res) => {
    const {username, email, password} = req.body;
    try{
        const Existir = await user.findOne({username})
        if(Existir){
            throw new Error("Usuário Já Cadastrado!")
        }
        const post = new user({ username, email, password})
        await post.save();
        res.redirect('/')
    }
    catch(err){
        res.status(500).send(`<script>
        alert("Ocorreu um erro: ${err.message}");
        window.history.back();
         </script>`)
        
    }
})
//  
// 
// LOGINNNN
// 
// 
const loginSchema = new mongoose.Schema({
    username: String,
    password: String
});
//usando o modelo login e vinculandoa o ids.
const Login = mongoose.model('login', loginSchema, 'ids');


app.post("/login", async(req, res) => {
    // se ele não encontar, ele lança o erro, se encontrar ele manda para a página de adicionar carros!
    const { username, password } = req.body;
    try {
        const login = await Login.findOne({ username, password });
        if (!login) {
            throw new Error("Usuário Não Cadastrado!!")
        }else {
            res.redirect('/add')
        }
    }
    catch (err) {
        res.status(500).send(`<script>
        alert("Ocorreu um erro: ${err.message}");
        window.history.back();
         </script>`)
        
    }
});
// 
// 
// 
// receber os dados do carro...
const carSchema = new mongoose.Schema({
    Model: String,
    Fabricante: String,
    Quantity: Number,
    Date: Number
})
// modelcar - carInfs é o que vai para o mongodb.
const ModelCar = mongoose.model("CarInfs", carSchema)
// -------------------------------
app.post("/adicionar", async(req,res)=>{
    // fazendo a requisicao do html
    const {Model, Fabricante, Quantity, Date} = req.body
    const carros = new ModelCar({Model, Fabricante, Quantity, Date})
    try{
        // fará a busca no bacno de dados.
        const ExistirCarro = await ModelCar.findOne({Model, Date});
        if(ExistirCarro){
            throw new Error("Modelo Já Existente No Sitema!")
        }
        // renderizar os carros
        await carros.save()
        res.redirect('/add')
    }
    catch(err){
        res.status(500).send(`<script>
        alert("Ocorreu um erro: ${err.message}");
        window.history.back();
         </script>`)
        
    }
})
// 
// 
// 
// Remove.... estamos usando o shcema anterior...
app.post("/remover", async(req,res)=>{
    // faco a req do html.
    const {Model, Date} = req.body;
    try{
        // busco no bd, o model e date, se bater com oq digitei ele remove.
        const Delete = await ModelCar.findOneAndDelete({Model, Date});
        if(Delete){
            res.redirect("/remove")
        }else{
            throw new Error("Carro não Encontrado")
        }
        
    }
    catch(err){
        res.status(500).send(`
        <script>
        alert("Ocorreu um erro: ${err.message}");
        window.history.back();
        </script>
        `)
    }
})
// Update
app.post("/atualizar", async(req,res)=>{
    // essas sao as variaveis que estou chamando da pagina update.
    const {Model, Quantity, Date} = req.body;
    try{
        // bsusacndo do model no banco de dados.
        const Update = await ModelCar.findOne({Model, Date});
        if(!Update){
            throw new Error("Carro não Encontrado")
        }
        const QuantidadeCar = Quantity

        if(isNaN(QuantidadeCar) || QuantidadeCar < 0){
            throw new Error("Quantidade do carro tem que ser maior do que 0")
        }
        // a falar que o que está no bd, vai ser atualizado com oq eu mandei na página.
        Update.Quantity = QuantidadeCar
        await Update.save()
        res.redirect('/Update')
    }
    catch(err){
        res.status(500).send(`
        <script>
        alert("Ocorreu um erro: ${err.message}");
        window.history.back();
        </script>
        `)
    }
})
// render
app.get("/listagem", async (req, res) => {
    try {
      const carros = await ModelCar.find();
      res.render("listagem.ejs", { carros });
    } catch (err) {
      console.log("err",err)
    }
  });
// Decrementar a quantidade do carro
app.post("/decrementar", async (req, res) => {
    const carroId = req.body.carroId;
  
    try {
      const carro = await ModelCar.findById(carroId);
  
      if (carro.Quantity <= 0) {
        const deletedCar = await ModelCar.findOneAndDelete({ _id: carroId });
        if (deletedCar) {
            throw new Error("Carro Fora de Estoque!")
          
        }

      }
  
      carro.Quantity -= 1;
      await carro.save();
  
      res.redirect("/listagem");
    } catch (err) {
      res.status(500).send(`
        <script>
          alert("Ocorreu um erro: ${err.message}");
          window.history.back();
        </script>
      `);
    }
  });
  

app.listen(2000, ()=>{
    console.log("Running at LocalHost")
})
