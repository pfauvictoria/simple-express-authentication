var express = require('express')
var logger = require('morgan')
var bodyParser = require('body-parser')
var buffer = require('buffer')
var axios = require('axios')

// Create an instance of the express function
var app = express()

// We want our html files to be ejs instead
app.set('view engine', 'ejs')

// Serve static content
// Everything the user will see can be found in the views folder
app.use(express.static('views'))
app.use(logger('dev'))

// Gives the server access to user input
// Passes info through a url and it's encoded
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))

app.set('views', __dirname + '/views')

app.get('/', function(request, response){
    response.render('login.ejs')
})

app.post('/', function(request, response){
    console.log(request.body)
    
    var userInput = request.body.friends
    var friendsArray = userInput.split(",")
    // array now looks like ['me', 'you', 'them'...]
    
    var groups = []
    var currentPair = []
    while (friendsArray.length) {
        var rand = Math.floor(Math.random() * friendsArray.length)
        var student = friendsArray[rand]
        currentPair.push(student)
        friendsArray.splice(rand, 1)
        
        if (currentPair.length > 1) {
            groups.push(currentPair)
            currentPair = []
        }
    }
    response.render('results.ejs', { groups: groups })
})

app.post('/login', function(req, res) {
    var username = req.body.username
    var password = req.body.password
    
    var b = new buffer.Buffer(username + ':' + password)
	var encodedAuth = b.toString('base64')    
    
    axios.get('https://api.github.com/user', {
		headers: {
			'Authorization': 'Basic ' + encodedAuth
		}        
    })
    .then(function(response){
		if (response.status >= 200 && response.status < 300) {
			res.render('home.ejs', {user: response.data})
		} else {
		    res.render('login.ejs')
		}       
    })
    // .then(function(data){
    //     return data.json()
    // })
    .then(function(response){
        console.log(response.data)
    })
    .catch(function(error){
        console.log(error)
    })
    
})

// app.get('/other-route', function(req, res){
//     response.render('other.ejs')
// })

var port = process.env.PORT || 8080

app.listen(port, function(){
    console.log('App running on port ' + port)
})