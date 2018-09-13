function Compile(el, vm) {
    // 将挂载点dom缓存
    this.el = document.querySelector(el);
    this.vm = vm;
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    init: function() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileNode(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    },
    nodeToFragment: function(el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        while (child) {
            // 将dom元素移入fragment中
            fragment.appendChild(child); // appendChild会把元素从el中删除插入到fragment
            child = el.firstChild;
        }
        return fragment;
    },
    /**
     * 递归遍历el并替换模板数据初始化视图，
     * 同时将模板指令对应的节点绑定对应的更新函数，初始化相应的订阅器
     * @param {*} el 
     */
    compileNode: function(el) {
        var childNodes = el.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(function(node) { // 浅拷贝childNodes并遍历

            var reg = /\{\{(.*?)\}\}/; // （）分组捕获方便后续获取 {{}} 中的内容
            var text = node.textContent;
            if (self.isTextNode(node) && reg.test(text)) { // 判断符合 {{}} 模板语法
                self.compileText(node, reg.exec(text)[1]);
            } else if (self.isElementNode(node)) { // 判断 是标签
                self.compileDirective(node); // 编译指令
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileNode(node); // 继续递归遍历子节点
            }
        })
    },

    compileDirective: function(node) {
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, function(attr) {
            var attrName = attr.name;

            if (self.isDirective(attrName)) { // 指令 v-
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) { // 事件指令 v-on:
                    self.compileEvent(node, self.vm, exp, dir);
                } else if (self.isVModel(dir)) { // v-model
                    self.compileVModel(node, self.vm, exp);
                }
            }
        })
    },
    compileEvent: function(node, vm, exp, dir) {
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    compileVModel: function(node, vm, exp) {
        var self = this;
        var val = this.vm[exp];
        this.updateVModel(node, val);
        new Watcher(this.vm, exp, function(value) {
            self.updateVModel(node, value);
        });
        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },
    /**
     * 初始化node中的{{xxx}} 并生成exp的订阅者
     * @param {*} node 
     * @param {*} exp 
     */
    compileText: function(node, exp) {
        var self = this;
        var initText = this.vm[exp];
        this.updateText(node, initText); // 将初始化的数据初始化到视图中
        new Watcher(this.vm, exp, function(value) { // 生成订阅器并绑定更新函数 也就是数据更新后会通知这个node改变视图
            self.updateText(node, value);
        })
    },
    updateText: function(node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    updateVModel: function(node, value) {
        node.value = typeof value === 'undefined' ? '' : value;
    },
    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },
    isEventDirective: function(attr) {
        return attr.indexOf('on:') == 0;
    },
    isVModel: function(attr) {
        return attr.indexOf('model') == 0;
    },
    isTextNode: function(node) {
        return node.nodeType == 3;
    },
    isElementNode: function(node) {
        return node.nodeType == 1;
    }


}