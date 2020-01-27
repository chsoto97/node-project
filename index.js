let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let {StudentList} = require('./model');

let jsonParser = bodyParser.json();
let app = express();

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	if (req.method === "OPTIONS") {
		return res.send(204);
	}
	next();
});

app.use(express.static('public'));
app.use(morgan('dev'));

let estudiantes = [{
	nombre : "Miguel",
	apellido : "Ángeles",
	matricula : 1730939
},
{
	nombre : "Erick",
	apellido : "González",
	matricula : 1039850
},
{
	nombre : "Victor",
	apellido : "Villarreal",
	matricula : 1039863
},
{
	nombre : "Victor",
	apellido : "Cárdenas",
	matricula : 816350
}];

app.get('/api/students', (req, res) =>{
	StudentList.getAll()
		.then( studentList =>{
			return res.status(200).json(studentList);
		})
		.catch( error =>{
			console.log(error);
			res.statusMessage = "Hubo un error de conexión con la base de datos.";
			return res.status(500).send();
		})
});

app.get('/api/getById', (req, res) =>{
	let id = req.query.id;
	StudentList.getById(id)
	.then( studentList =>{
			return res.status(200).json(studentList);
		})
		.catch( error =>{
			console.log(error);
			res.statusMessage = "Hubo un error de conexión con la base de datos.";
			return res.status(500).send();
		})
});

app.get('/api/getByName/:name', (req, res) =>{
	let name = req.params.name;
	StudentList.getByName(name)
	.then( studentList =>{
			return res.status(200).json(studentList);
		})
		.catch( error =>{
			console.log(error);
			res.statusMessage = "Hubo un error de conexión con la base de datos.";
			return res.status(500).send();
		})
});

app.post('/api/newStudent', jsonParser, (req, res) =>{
	if(req.body.nombre == "" || req.body.apellido == "" || req.body.matricula == "" ){
		res.statusMessage = "Falta información para agregar al alumno.";
		return res.status(406).send();
	}
	StudentList.createStudent(req.body.nombre, req.body.matricula, req.body.apellido)
		.then( studentList =>{
			return res.status(200).json(studentList);
		})
		.catch( error =>{
			console.log(error);
			res.statusMessage = "Hubo un error de conexión con la base de datos.";
			return res.status(500).send();
		})
});

app.put('/api/updateStudent/:matricula', jsonParser, (req, res) =>{
	if(req.params.matricula != req.body.matricula){
		res.statusMessage = "Las matrículas enviadas no coinciden.";
		return res.status(409).send();
	}
	if(req.body.matricula == "" || (req.body.nombre == "" && req.body.apellido == "")){
		res.statusMessage = "Faltan datos para actualizar.";
		return res.status(406).send();	
	}
	let result = estudiantes.find((elemento) =>{
		if(req.body.matricula == elemento.matricula){
			if(req.body.apellido!=""){
				elemento.apellido = req.body.apellido;
			}
			if(req.body.nombre!=""){
				elemento.nombre = req.body.nombre;
			}
			return elemento;
		}
	});
	if (result){
		return res.status(202).json(result);
	}
	res.statusMessage = "No se encontró al alumno.";
	return res.status(404).send();	
});

app.delete('/api/deleteStudent', jsonParser, (req, res) =>{
	if(req.query.matricula != req.body.matricula){
		res.statusMessage = "Las matrículas enviadas no coinciden.";
		return res.status(409).send();
	}
	if(req.body.matricula == ""){
		res.statusMessage = "Matrícula vacía.";
		return res.status(406).send();	
	}
	let result = estudiantes.find((elemento) =>{
		if(req.body.matricula == elemento.matricula){
			return elemento;
		}
	});
	if(result){
		estudiantes = estudiantes.filter((elemento) =>{
		if(elemento.matricula != result.matricula){
			return elemento;
		}
	});
		return res.status(204).json({});
	}
	res.statusMessage = "No se encontró al alumno.";
	return res.status(404).send();	
	
});

function runServer(port, databaseUrl){
	return new Promise( (resolve, reject ) => {
		mongoose.connect(databaseUrl, response => {
			if ( response ){
				return reject(response);
			} else{
				server = app.listen(port, () => {
					console.log( "App is running on port " + port );
					resolve();
				})
				.on( 'error', err => {
					mongoose.disconnect();
					return reject(err);
				})
			}
		});
	});
}

function closeServer(){
	return mongoose.disconnect()
		.then(() => {
			return new Promise((resolve, reject) => {
				console.log('Closing the server');
				server.close( err => {
					if (err){
						return reject(err);
					} else {
						resolve();
					}
				});
			});
		});
}

runServer(8080, "mongodb://localhost/university");

module.exports = {app, runServer, closeServer}