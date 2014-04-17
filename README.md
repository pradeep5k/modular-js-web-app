#Modular JS Web App v0.1
===================

### The project
A POC to demonstrate a modular javascript web app approach using some of the leading JS design patterns and libs. The objective of the POC is as follow:

1. How to allow lazy loading of the functional and visual modules on demand in a web application? Here definition of a module is an independent component/widget/sub app which can function and can be tested independently. This module can have its won HTML elements, styles and code.
2. How the modules can communicate with each other without creating any dependency and coupling?
3. How the style and code of a module can be scoped i.e. that it does not break any other modules style and functionality?
4. How to ensure that module gets killed completely when unloaded without breaking anything else in the code?

====================

###The proposed solution

1. Create an application architecture/infrastructure based on AMD concept. Which allows lazy loading of the required module. I have used requirejs for this purpose.
2. Implement an MV* pattern which and load module data from an external manifest file and create regions for loading modules later. I have used Backbone.Marionette for this purpose.
3. Each module starts with a Module class (mod.js) which gets loaded on demand using requirejs and rendered in the module regions. All the code of the module is encapsulated in a wrapped object to prevent any scope conflict.
5. The HTML of the module is rendered in the defined region and accessed through a context to prevent accessing wrong DOM element with the similar class name or id.
6. The CSS is written in the context of the module e.g. #mod_scope div{color: #000;}. The #mod_scope gets replaced with the unique id of module region at runtime. This scope down the access of the css into the module only.
7. The communication between the module is established using the mediator pattern to ensure complete decopuling.


=====================

To know about the implementation please read the code. index.html is a good starting point.
To run the POC host it on a web server and launch index.html.
This POC has been briefly tested on the latest versions of Firefox, Safari, and Chrome on a Mac 10.7.x machine.

=====================
Look forward to your feedback, ideas and any issue you find.
