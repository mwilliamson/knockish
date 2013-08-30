(function() {
    test("rendering template clones nodes", function() {
        addElement('<div id="template"><p>Hello</p></div>');
        
        var content = addElement('<div></div>');
        
        var template = knockish.createTemplate(document.getElementById("template"));
        content.appendChild(template.render());
        content.appendChild(template.render());
        
        strictEqual(content.innerHTML, "<p>Hello</p><p>Hello</p>");
    });
    
    test("can bind element body to text", function() {
        addElement('<div id="template"><p data-template="text: greeting">Hello</p></div>');
        
        var content = addElement('<div></div>');
        
        var template = knockish.createTemplate(document.getElementById("template"));
        content.appendChild(template.render({greeting: "Go away!<"}));
        
        strictEqual(content.innerHTML, '<p>Go away!&lt;</p>');
    });
    
    test("can bind element body to HTML", function() {
        addElement('<div id="template"><p data-template="html: greeting">Hello</p></div>');
        
        var content = addElement('<div></div>');
        
        var template = knockish.createTemplate(document.getElementById("template"));
        content.appendChild(template.render({greeting: "<strong>Go away!</strong>"}));
        
        strictEqual(content.innerHTML, '<p><strong>Go away!</strong></p>');
    });
    
    //~ test("bindings are mapped correctly when earlier binding changes DOM structure", function() {
        //~ addElement('<div id="template"><span data-template="html: greeting"></span> <span data-template="text: name"></span></div>');
        //~ 
        //~ var content = addElement('<div></div>');
        //~ 
        //~ var template = knockish.createTemplate(document.getElementById("template"));
        //~ content.appendChild(template.render({
            //~ greeting: "Go <strong>away</strong>",
            //~ name: "Bob"
        //~ }));
        //~ 
        //~ strictEqual(content.innerHTML, '<span>Go <strong>away</strong></span> <span>Bob</span>');
    //~ });
    
    test("can set attributes of elements", function() {
        addElement('<div id="template"><a data-template="attr: {href: url}">Hello</a></div>');
        
        var content = addElement('<div></div>');
        
        var template = knockish.createTemplate(document.getElementById("template"));
        content.appendChild(template.render({url: "/go"}));
        
        strictEqual(content.innerHTML, '<a href="/go">Hello</a>');
    });
    
    test("children of if are rendered if value is true", function() {
        addElement('<div id="template"><p data-template="if: greet"><span data-template="text: greeting"></span></p></div>');
        
        var content = addElement('<div></div>');
        
        var template = knockish.createTemplate(document.getElementById("template"));
        content.appendChild(template.render({greet: true, greeting: "Hello!"}));
        
        strictEqual(content.innerHTML, '<p><span>Hello!</span></p>');
    });
    
    test("children of if are not rendered if value is false", function() {
        addElement('<div id="template"><p data-template="if: greet"><span data-template="text: greeting"></span></p></div>');
        
        var content = addElement('<div></div>');
        
        var template = knockish.createTemplate(document.getElementById("template"));
        content.appendChild(template.render({greet: false}));
        
        strictEqual(content.innerHTML, '<p></p>');
    });
    
    test("can apply context directly to dom", function() {
        var content = addElement('<p data-template="text: greeting">Hello</p>');
        var parent = content.parentNode;
        
        knockish.applyBindings({greeting: "Go away!"}, content);
        
        strictEqual(parent.innerHTML, '<p>Go away!</p>');
    });


    function addElement(html) {
        var fixture = document.getElementById("qunit-fixture");
        var fragment = document.createElement("div");
        fragment.innerHTML = html;
        var element = fragment.firstChild;
        fixture.appendChild(element);
        return element;
    }
})();
