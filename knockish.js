(function() {
    knockish = {};
    
    knockish.createTemplate = createTemplate;
    knockish.applyBindings = applyBindings;
    
    function applyBindings(context, element) {
        var placeholder = document.createElement("span");
        element.parentNode.replaceChild(placeholder, element);
        
        var templateElement = document.createElement("div");
        templateElement.appendChild(element);
        var template = createTemplate(templateElement);
        
        var rendered = template.render(context);
        placeholder.parentNode.replaceChild(rendered, placeholder);
    }
    
    function createTemplate(original) {
        var fragment = cloneChildren(original);
        
        var bindings = findBindings(fragment);
        
        function render(context) {
            var result = fragment.cloneNode(true);
            
            forEach(bindings, function(binding) {
                var boundElement = result;
                forEach(binding.path, function(childNodeIndex) {
                    boundElement = boundElement.childNodes[childNodeIndex];
                });
                binding.func(boundElement, context);
            });
            
            return result;
        }
            
        return {
            render: render
        };
    }
    
    var bindingTypes = {
        text: function(value) {
            return {
                applyContext: function(element, context) {
                    element.innerHTML = htmlEscape(context[value]);
                }
            };
        },
        html: function(value) {
            return {
                applyContext: function(element, context) {
                    element.innerHTML = context[value];
                }
            };
        },
        attr: function(value) {
            var attrRegex = /^{\s*([^:]+)\s*:\s*([^,]+)}$/;
            var result = attrRegex.exec(value);
            if (result === null) {
                throw Error("Invalid attr value: " + value);
            }
            var attributeName = result[1];
            var attributeValue = result[2];
            
            return {
                applyContext: function(element, context) {
                    element.setAttribute(attributeName, context[attributeValue]);
                }
            };
        },
        "if": function(valueName, templateElement) {
            var template = createTemplate(templateElement);
            templateElement.innerHTML = "";
            
            return {
                applyContext: function(element, context) {
                    var value = context[valueName];
                    if (value) {
                        element.appendChild(template.render(context));
                    }
                },
                rendersChildren: true
            };
        }
    };
    
    function findBindings(element) {
        var bindings = [];
        
        function find(element, path) {
            var renderChildren = true;
            
            if (element.nodeType === Node.ELEMENT_NODE) {
                var bindingAttribute = element.getAttribute("data-template") || "";
                element.removeAttribute("data-template");
                
                var bindingStrings = bindingAttribute.split(",");
                
                forEach(bindingStrings, function(bindingString) {
                    var bindingRegexResult = /^([^:]*):\s*(.*?)\s*$/.exec(bindingString);
                    if (bindingRegexResult !== null) {
                        var name = bindingRegexResult[1];
                        var value = bindingRegexResult[2];
                        var bindingType = bindingTypes[name];
                        var binding = bindingType ? bindingType(value, element) : function() {};
                        bindings.push({
                            path: path,
                            func: binding.applyContext
                        });
                        renderChildren = renderChildren && !binding.rendersChildren;
                    }
                });
            }
            
            if (renderChildren) {
                forEach(element.childNodes, function(child, index) {
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        find(child, path.concat([index]));
                    }
                });
            }
        }
        
        find(element, []);
        return bindings;
    }
    
    function cloneChildren(element) {
        var clonedElement = element.cloneNode(true);
        var fragment = document.createDocumentFragment();
        while (clonedElement.firstChild) {
            fragment.appendChild(clonedElement.firstChild);
        }
        return fragment;
    }
    
    if (Array.prototype.forEach) {
        var forEach = function(array, func) {
            return Array.prototype.forEach.call(array, func);
        };
    } else {
        var forEach = function(array, func) {
            for (var index = 0; index < array.length; index++) {
                func(array[index], index);
            }
        };
    }
    
    function htmlEscape(string) {
        return string
            .replace(/&/g, '&amp;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
    }
})();
