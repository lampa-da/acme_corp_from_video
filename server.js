const Sequelize = require('sequelize')
const {STRING, UUID, UUIDV4} = Sequelize
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_corp_db')

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

const Department =conn.define('department', {
  name: {
    type: STRING(20),
  }
})

const Employee =conn.define('employee', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  name: {
    type: STRING(20),
  }
})

Department.belongsTo(Employee, { as: 'manager'})
Employee.hasMany(Department, { foreignKey: 'managerId'})

Employee.belongsTo(Employee, {as: 'supervisor'})
Employee.hasMany(Employee, { foreignKey: 'supervisorId', as: 'supervisees'})

const syncAndSeed = async()=>{
  await conn.sync({force: true})
  const [moe, lucy, larry, hr, engineering] = await Promise.all([
    Employee.create({name: 'moe'}),
    Employee.create({name: 'lucy'}),
    Employee.create({name: 'larry'}),
    Department.create({name: 'hr'}),
    Department.create({name: 'engineering'})
  ])

  hr.managerId = lucy.id; // don't foreget to use an alias, not the original name of the table
  await hr.save();
  console.log(JSON.stringify(hr, null, 2)) //to get the info of specific table in readable form
  moe.supervisorId = lucy.id
  larry.supervisorId = lucy.id
  await Promise.all([
    moe.save(),
    larry.save()
  ])
}

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