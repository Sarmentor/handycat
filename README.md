# Introduction

This is the main repo for the prototype web-based CAT tool developed at CNGL.  

#Build Instructions     

The frontend is built entirely with javascript, using the [Angular](http://angularjs.org/) framework.     

To set up your development environment, it's strongly recommended that you use the development stack consisting of:      

* [bower](http://bower.io/) - for frontend package management
* [grunt](http://gruntjs.com/) - for automating the build and deployment, running tests, and providing the development server (using packages from npm)
* [npm](https://www.npmjs.org/) - for managing the node js dependencies     

## Installation    

1. Install node and npm if you don't already have them.

```
# if you do it this way, you may need to use `sudo` for `npm -g ...` commands
sudo apt-get install nodejs
sudo apt-get install npm
sudo ln -s /usr/bin/nodejs /usr/bin/node
```

2. clone (or fork) the repo, for example: `git clone https://github.com/chrishokamp/handycat.git`
3. install grunt `npm install -g grunt`
3. install grunt-cli `npm install -g grunt-cli`
3. install bower `npm install -g bower`
3. run `$ npm install` from the top directory(`handycat/`)
4. run `$ bower install` from the top directory(`handycat/`)
5. build bootstrap ui manually
  ```
  $ cd app/bower_components/angular-ui-bootstrap
  $ npm install
  $ grunt
  ```

6. [install mongodb](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

7. install redis
```
sudo add-apt-repository ppa:chris-lea/redis-server
sudo apt-get update
sudo apt-get install redis-server
```

8. install the XLIFF creator and vocabulary server microservices

First, install `pm2` because it makes things easy
```
npm install -g pm2`
```

Now install the microservice dependencies:

```
cd microservices/vocabulary_server
npm install

cd ../xliff_creator
npm install
```


9. to use the *autoreload* and *watch changes* functionalities, you'll need ruby and compass.   
  * [install Ruby](https://www.ruby-lang.org/en/installation/), then do:
   ```
   sudo gem install compass
   sudo gem install sass
   ```  
  <!--* make sure that your ruby installation's bin/ folder is on your `$PATH`-->
 
 
Finally, once you've done all that, you're ready to start developing!

## Development

1. start mongodb `mongod --fork --logpath=mongod.log --smallfiles`

2. start the microservices
```
cd handycat/
pm2 start microservices/vocabulary_server/web.js
pm2 start microservices/xliff_creator/web.js
```

3. start HandyCAT with live reload
```
grunt express-server
```

`grunt express-server` will fire up a server which watches all of the files in the repo, and automagically reloads whenever you change something. 

Note: the command was previously `grunt serve`, but this was changed so that both the server and the UI reload automagically.


### Code Style
* use *two spaces* to indent javascript

### Styles
* the project uses [sass](http://sass-lang.com/) and makes use of mixins and css variables in the app/styles/ directory
* you need at least sass 3.3 -- do `sass -v` to check your version, `gem install sass` to install/update

## Running the microservices

Depending which parts of HandyCAT you want to use, you may need to start one or more of the microservices for the
application to work.

## Testing

# Building and Deploying

* The command `grunt build` will build the client application into dist/

* deployment scripts TODO: writeme

### Language Codes
Some parts of the application rely upon the language tags in the XLIFF being in a format that we understand. HandyCAT adheres to the [XLIFF 2.0 requirements](http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html#srclang) for the `srcLang` (required) and `trgLang` (optional) attributes, and assumes that language codes are in a format [like this](http://tools.ietf.org/html/bcp47#appendix-A).

