const {conn, syncAndSeed, models: {Department, Employee}} = require('./db')

const express = require('express')
const app = express()

app.get ('/api/department', async(req, res, next)=>{
  try{
    res.send(await Department.findAll({
      include: [ 
        {
          model: Employee,
          as: 'manager'
        }

       ]
    }))
  }
  catch(ex){
    next(ex)
  }
})

app.get ('/api/employees', async(req, res, next)=>{
  try{
    res.send(await Employee.findAll({
      include: [ 
        {
          model: Employee,
          as: 'supervisor'
        },
        { 
          model: Employee, // it's a table of people who are  been supervized
          as: 'supervisees'
        },
        Department
       ]
    }))
  }
  catch(ex){
    next(ex)
  }
})


const init = async()=>{
  try{
    await syncAndSeed()
    const port =process.env.PORT || 3000
    app.listen(port, ()=> console.log(`listening on port ${port}`))

    await conn.authenticate()
  }
  catch(ex){
    console.log(ex)
  }
}
init()