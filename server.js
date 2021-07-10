const express=require('express');
const connectDB=require('./config/db');

const app=express();

//connect database
connectDB();

//initiate middle (bodyparser for user register/login in user.js)
app.use(express.json({extended:false}));


app.get('/',(req,res)=> res.send('API Running'));
//app.use '/' -> '/xxx/xxxxx' etc; app.get '/' -> only '/'; 
//use '/' so if '/xxx/xxxxx', not reaching following app.use/get/post etc

//define routes
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/posts',require('./routes/api/posts'));
//use -> use or get/post etc or route().get/post etc in api routes //get->not reaching apiroutes route path

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>console.log(`Server started on port ${PORT}`));