let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let studentCollection = mongoose.Schema({
	nombre : {type : String},
	apellido : {type : String},
	matricula : {
		type: Number,
		required : true,
		unique : true
	}
});

let Student = mongoose.model('students', studentCollection);

let StudentList = {
	getAll : function(){
		return Student.find()
			.then(students =>{
				return students;
			})
			.catch(error =>{
				throw Error(error);
			});
	},
	getById : function(id){
		return Student.find({matricula: id})
			.then(students =>{
				return students;
			})
			.catch(error =>{
				throw Error(error);
			});
	},
	getByName : function(name){
		return Student.find({nombre: name})
			.then(students =>{
				return students;
			})
			.catch(error =>{
				throw Error(error);
			});
	},
	createStudent : function(name, id, ap){
		let newStudent = {
			"nombre": name,
			"matricula": id,
			"apellido": ap
		}
		return Student.create(newStudent)
			.then(students =>{
				return newStudent;
			})
			.catch(error =>{
				throw Error(error);
			});
	},
	updateStudent : function(name, id, ap){
		let idToUpdate = {
			"matricula" : id
		}
		let updatedStudent = {
			"nombre": name,
			"matricula": id,
			"apellido": ap
		}
		return Student.update(idToUpdate, updatedStudent)
			.then(students =>{
				return updatedStudent;
			})
			.catch(error =>{
				throw Error(error);
			});
	}
}

module.exports = {
	StudentList
};