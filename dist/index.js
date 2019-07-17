// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"ZgGC":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("./shared");

function failAfterFiveSeconds(p) {
  return new Promise((res, rej) => {
    setTimeout(() => rej({
      error: true,
      message: 'Server is not responding'
    }), 5000);
    p.then(res);
  });
}

function convertServerResponseToAskFinished(response) {
  if (response.error) {
    const v = {
      status: AskStatus.ERROR,
      message: response.message
    };
    return v;
  } else {
    const v = {
      status: AskStatus.LOADED,
      val: response.val
    };
    return v;
  }
}

exports.convertServerResponseToAskFinished = convertServerResponseToAskFinished;

function getResultOrFail(askFinished) {
  if (askFinished.status == AskStatus.ERROR) {
    throw askFinished.message;
  } else {
    return askFinished.val;
  }
}

exports.getResultOrFail = getResultOrFail;

function askServer(args) {
  return __awaiter(this, void 0, void 0, function* () {
    console.log('[server] args', args);
    const result = yield failAfterFiveSeconds(realServer(args));
    console.log('[server] result', result);
    return convertServerResponseToAskFinished(result);
  });
}

exports.askServer = askServer;
/*
KEY CONCEPT: how data is kept in sync
Suppose multiple people are using the app at once. When someone sends a change to the server, onClientNotification methods for ALL OTHER clients are called, which basically tell the other clients to "make XYZ change to your local copy of the data".
*/

function onClientNotification(args) {
  return __awaiter(this, void 0, void 0, function* () {
    console.log('[server notification]', args);
    const getResource = {
      tutors: () => shared_1.tutors,
      learners: () => shared_1.learners,
      bookings: () => shared_1.bookings,
      matchings: () => shared_1.matchings,
      requests: () => shared_1.requests,
      requestSubmissions: () => shared_1.requestSubmissions
    };

    if (args[0] === 'update') {
      getResource[args[1]]().state.onServerNotificationUpdate(args[2]);
    }

    if (args[0] === 'delete') {
      getResource[args[1]]().state.onServerNotificationDelete(args[2]);
    }

    if (args[0] === 'create') {
      getResource[args[1]]().state.onServerNotificationCreate(args[2]);
    }
  });
}

exports.onClientNotification = onClientNotification;
var AskStatus;

(function (AskStatus) {
  AskStatus["LOADING"] = "LOADING";
  AskStatus["LOADED"] = "LOADED";
  AskStatus["ERROR"] = "ERROR";
})(AskStatus = exports.AskStatus || (exports.AskStatus = {}));

class MockResourceServerEndpoint {
  constructor(resource, contents) {
    // IMPORTANT: the resource field is ":() => Resource" intentionally.
    // The general rule is that exported variables from another module
    // aren't available until runtime.
    this.nextKey = 1000; // default ID is very high for testing purposes
    // Making it ":Resource" directly, results in an error.

    this.resource = resource;
    this.contents = contents;
  }

  success(val) {
    return {
      error: false,
      message: null,
      val
    };
  }

  error(message) {
    return {
      error: true,
      message,
      val: null
    };
  }

  processClientAsk(args) {
    console.log('[mock server] endpoint', this.resource().name, args);

    if (args[0] === 'retrieveAll') {
      return this.success(this.contents);
    }

    if (args[0] === 'update') {
      this.contents[String(args[1].id)] = args[1];
      onClientNotification(['update', this.resource().name, args[1]]);
      return this.success(null);
    }

    if (args[0] === 'create') {
      if (args[1].date === -1) {
        args[1].date = Date.now();
      }

      if (args[1].id === -1) {
        args[1].id = this.nextKey;
        ++this.nextKey;
      }

      this.contents[String(args[1].id)] = args[1];
      onClientNotification(['create', this.resource().name, args[1]]);
      return this.success(this.contents[String(args[1].id)]);
    }

    if (args[0] === 'delete') {
      delete this.contents[String(args[1])];
      onClientNotification(['delete', this.resource().name, args[1]]);
      return this.success(null);
    }

    throw new Error('args not matched');
  }

  replyToClientAsk(args) {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((res, rej) => {
        setTimeout(() => {
          try {
            res(this.processClientAsk(args));
          } catch (v) {
            rej(v);
          }
        }, 500); // fake a half-second delay
      });
    });
  }

}

exports.mockResourceServerEndpoints = {
  tutors: new MockResourceServerEndpoint(() => shared_1.tutors, {
    '1': {
      id: 1,
      date: 1561334668346,
      firstName: 'John',
      lastName: 'Doe',
      friendlyName: 'Jo',
      friendlyFullName: 'Jo-Do',
      grade: 12,
      mods: [1, 2],
      modsPref: [1],
      subjectList: 'Geometry, Spanish'
    },
    '2': {
      id: 2,
      date: 1561335668346,
      firstName: 'Mary',
      lastName: 'Watson',
      friendlyName: 'Ma',
      friendlyFullName: 'Ma-W',
      grade: 9,
      mods: [3, 4],
      modsPref: [4],
      subjectList: 'English, French'
    }
  }),
  learners: new MockResourceServerEndpoint(() => shared_1.learners, {
    '1': {
      id: 1,
      date: 1561334668346,
      firstName: 'Alex',
      lastName: 'Doe',
      friendlyName: 'Al',
      friendlyFullName: 'Al-D',
      grade: 12
    }
  }),
  bookings: new MockResourceServerEndpoint(() => shared_1.bookings, {}),
  matchings: new MockResourceServerEndpoint(() => shared_1.matchings, {}),
  requests: new MockResourceServerEndpoint(() => shared_1.requests, {}),
  requestSubmissions: new MockResourceServerEndpoint(() => shared_1.requestSubmissions, {
    '1': {
      firstName: 'a',
      lastName: 'b',
      friendlyName: 'c',
      friendlyFullName: 'd',
      grade: 1,
      mods: [1, 3, 4],
      subject: 'asdf',
      id: 1,
      date: 1561730705297
    }
  })
};

function realServer(args) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const val = yield new Promise((res, rej) => {
        window['google'].script.run.withFailureHandler(rej).withSuccessHandler(res).onClientAsk(args);
      }); // NOTE: an "error: true" response is still received by the client through withSuccessHandler().

      return JSON.parse(val);
    } catch (err) {
      return {
        error: true,
        val: null,
        message: shared_1.stringifyError(err)
      };
    }
  });
}

function mockServer(args) {
  return __awaiter(this, void 0, void 0, function* () {
    // only for resources so far
    try {
      const mockArgs = JSON.parse(JSON.stringify(args));
      return yield exports.mockResourceServerEndpoints[mockArgs[0]].replyToClientAsk(mockArgs.slice(1));
    } catch (err) {
      return {
        error: true,
        val: null,
        message: shared_1.stringifyError(err)
      };
    }
  });
}
},{"./shared":"m0/6"}],"IhYu":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");

function FormWidget(fields) {
  const widgets = {};
  const dom = shared_1.container('<form></form>')(fields.map(({
    title,
    type,
    name
  }) => {
    const widget = type();
    widgets[name] = widget;
    return shared_1.container('<div class="form-group row"></div>')(shared_1.container('<label class="col-2 col-form-label"></label>')(title), shared_1.container('<div class="col-10"></div>')(widget.dom));
  }));
  return {
    dom,

    getAllValues() {
      const result = {};

      for (const {
        name
      } of fields) {
        result[name] = widgets[name].getValue();
      }

      return result;
    },

    setAllValues(values) {
      for (const [name, value] of Object.entries(values)) {
        if (widgets[name] === undefined) {
          throw new Error('name ' + String(name) + ' does not exist in form');
        }

        widgets[name].setValue(value);
      }
    }

  };
}

exports.FormWidget = FormWidget;
},{"../core/shared":"m0/6"}],"8cu6":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");

class KeyMaker {
  constructor() {
    this.nextKey = 0;
  }

  makeKey() {
    const result = this.nextKey;
    this.nextKey += 1;
    return result;
  }

}

const windowKeyMaker = new KeyMaker(); // Assume that all windows are tiled. So all WindowWidgets will be made from makeTiledWindow().

function WindowWidget(content, actionBarContent) {
  return shared_1.DomWidget(shared_1.container('<div class="card m-3"></div>')(shared_1.container('<div class="card-header"></div>')(actionBarContent), shared_1.container('<div class="card-body"></div>')(content)));
}

function useTiledWindow(content, actionBarContent, title, onLoad = new shared_1.Event()) {
  const key = windowKeyMaker.makeKey();
  const windowWidget = WindowWidget(content, actionBarContent);
  shared_1.addWindow(windowWidget, key, title, onLoad);
  return {
    windowWidget,
    minimizeWindow: () => shared_1.hideWindow(key),
    closeWindow: () => shared_1.removeWindow(key),
    onLoad
  };
}

exports.useTiledWindow = useTiledWindow;
},{"../core/shared":"m0/6"}],"T2q6":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
TODO: badge, dropdown, and search
*/

const shared_1 = require("../core/shared");
/*export function LoaderWidget() {
    const spinner = container('<div></div>')(
        $('<strong>Loading...</strong>'),
        $('<div class="spinner-border"></div>')
    );
    const dom = container('<div></div>')(spinner);
    const onLoaded = (child: JQuery) => {
        dom.empty();
        dom.append(child);
    };
    const onError = (message: string) => {
        const errorMessageDom = container(
            '<div class="alert alert-danger"></div>'
        )(container('<h1></h1>')('Error'), container('<span></span>')(message));
        dom.empty();
        dom.append(errorMessageDom);
    };

    return {
        dom,
        onLoaded,
        onError
    };
}*/


function ErrorWidget(message) {
  const dom = shared_1.container('<div class="alert alert-danger"></div>')(shared_1.container('<h1></h1>')('Error'), $('<p><strong>An error occurred. You can try closing the window and opening again.</strong></p>'), shared_1.container('<span></span>')(message));
  return shared_1.DomWidget(dom);
}

exports.ErrorWidget = ErrorWidget;

function ButtonWidget(content, onClick, variant = 'primary') {
  // to create an outline button, add "outline" to the variant
  if (variant === 'outline') variant = 'outline-primary';

  if (typeof content === 'string') {
    return shared_1.DomWidget($('<button></button>').text(content).addClass('btn btn-' + variant).click(onClick));
  } else {
    return shared_1.DomWidget($('<button></button>').append(content).addClass('btn btn-' + variant).click(onClick));
  }
}

exports.ButtonWidget = ButtonWidget;
const modalHtmlString = `<div class="modal" tabindex="-1" role="dialog">
<div class="modal-dialog" role="document">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title"></h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
    </div>
    <div class="modal-footer">
    </div>
  </div>
</div>
</div>`;

function showModal(title, content, buildButtons) {
  return __awaiter(this, void 0, void 0, function* () {
    const dom = $(modalHtmlString);
    dom.find('.modal-title').text(title);
    dom.find('.modal-body').append(typeof content === 'string' ? shared_1.container('<p></p>')(content) : content);
    dom.find('.modal-footer').append(buildButtons.call(null, (text, style, onClick) => $('<button type="button" class="btn" data-dismiss="modal">').addClass('btn-' + style).click(onClick).text(text)));
    dom.modal();
    return new Promise(res => {
      dom.on('hidden.bs.modal', () => res());
    });
  });
}

exports.showModal = showModal;

function FormStringInputWidget(type) {
  const dom = $(`<input class="form-control" type="${type}">`);
  return {
    dom,

    getValue() {
      return String(dom.val());
    },

    setValue(newVal) {
      return dom.val(newVal);
    },

    onChange(doThis) {
      dom.val(() => doThis.call(null, dom.val()));
    }

  };
}

exports.FormStringInputWidget = FormStringInputWidget;

function FormNumberInputWidget(type) {
  let dom = null;

  if (type === 'number') {
    dom = $(`<input class="form-control" type="number">`);
  }

  if (type === 'datetime-local') {
    dom = $(`<input class="form-control" type="datetime-local">`);
  }

  if (type === 'id') {
    // TODO: create a resource selection dropdown, or at least a name search
    dom = $(`<input class="form-control" type="number">`);
  }

  function getVal() {
    if (type == 'datetime-local') {
      // a hack to get around Typescript types
      const htmlEl = dom.get(0);
      const date = htmlEl.valueAsNumber;
      return date ? date : 0;
    }

    return Number(dom.val());
  }

  return {
    dom,

    getValue() {
      return getVal();
    },

    setValue(val) {
      if (type == 'datetime-local') {
        // a hack to get around Typescript types
        const htmlEl = dom.get(0);
        htmlEl.valueAsNumber = val;
        return dom;
      }

      return dom.val(val);
    },

    onChange(doThis) {
      dom.val(doThis.call(null, getVal()));
    }

  };
}

exports.FormNumberInputWidget = FormNumberInputWidget;

function FormNumberArrayInputWidget(type) {
  let dom = null;

  if (type === 'number') {
    // arrays are entered as comma-separated values
    dom = $(`<input class="form-control" type="text">`);
  } else {
    throw new Error('unsupported type');
  }

  function getVal() {
    return String(dom.val()).split(',').map(x => x.trim()).filter(x => x !== '').map(x => Number(x));
  }

  return {
    dom,

    getValue() {
      return getVal();
    },

    setValue(val) {
      return dom.val(val.map(x => String(x)).join(', '));
    },

    onChange(doThis) {
      dom.val(doThis.call(null, getVal()));
    }

  };
}

exports.FormNumberArrayInputWidget = FormNumberArrayInputWidget;

function StringField(type) {
  return () => FormStringInputWidget(type);
}

exports.StringField = StringField;

function NumberField(type) {
  return () => FormNumberInputWidget(type);
}

exports.NumberField = NumberField;

function SelectField(options, optionTitles) {
  return () => FormSelectWidget(options, optionTitles);
}

exports.SelectField = SelectField;

function NumberArrayField(type) {
  return () => FormNumberArrayInputWidget(type);
}

exports.NumberArrayField = NumberArrayField;

function FormSubmitWidget(text) {
  return shared_1.DomWidget($('<button class="btn btn-outline-success type="submit"></button>').text(text));
}

exports.FormSubmitWidget = FormSubmitWidget;

function FormSelectWidget(options, optionTitles) {
  const dom = shared_1.container('<select class="form-control"></select>')(options.map((_o, i) => shared_1.container('<option></option>')(optionTitles[i]).val(options[i])));
  const k = {
    dom,

    getValue() {
      return dom.val();
    },

    setValue(val) {
      return dom.val(val);
    },

    onChange(doThis) {
      dom.change(() => doThis.call(null, dom.val()));
    }

  };
  return k;
}

exports.FormSelectWidget = FormSelectWidget;

function FormToggleWidget(titleWhenFalse, titleWhenTrue, styleWhenFalse = 'outline-secondary', styleWhenTrue = 'primary') {
  function setVal(newVal) {
    if (val === newVal) return;

    if (newVal) {
      val = true;
      dom.text(titleWhenTrue);
      dom.removeClass('btn-' + styleWhenFalse);
      dom.addClass('btn-' + styleWhenTrue);
      return dom;
    } else {
      val = false;
      dom.text(titleWhenFalse);
      dom.removeClass('btn-' + styleWhenTrue);
      dom.addClass('btn-' + styleWhenFalse);
      return dom;
    }
  }

  const dom = $('<button class="btn"></button>').click(() => {
    if (val === null) {
      throw new Error('improper init of toggle button');
    }

    setVal(!val);
  });
  let val = null;
  const k = {
    dom,

    getValue() {
      if (val === null) throw new Error('attempt to read toggle button value before init');
      return val;
    },

    setValue(val) {
      setVal(val);
      return dom;
    },

    onChange(doThis) {
      dom.click(() => doThis.call(null, val));
    }

  };
  return k;
}

exports.FormToggleWidget = FormToggleWidget;

function SearchItemWidget(onSubmit) {
  return shared_1.DomWidget($('<form class="form-inline"></form>').append(FormStringInputWidget('search').dom).append(FormSubmitWidget('Search').dom).submit(ev => {
    ev.preventDefault();
    onSubmit.call(null);
  }));
}

exports.SearchItemWidget = SearchItemWidget;

function createMarkerLink(text, onClick) {
  return $('<a style="cursor: pointer"></a>').text(text).click(onClick);
}

exports.createMarkerLink = createMarkerLink;

function MessageTemplateWidget(content) {
  const textarea = $('<textarea class="form-control"></textarea>');
  textarea.val(content);
  const button = ButtonWidget('Copy to clipboard', () => {
    const htmlEl = textarea[0];
    htmlEl.select();
    document.execCommand('copy');
    button.val('Copied!');
    setTimeout(() => button.val('Copy to clipboard'), 1000);
  });
  return shared_1.DomWidget(shared_1.container('<div class="card"></div>')(shared_1.container('<div class="card-body"></div>')(textarea, button)));
}

exports.MessageTemplateWidget = MessageTemplateWidget;
},{"../core/shared":"m0/6"}],"DVx/":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");

const ui_1 = require("./ui");

function ActionBarWidget(config) {
  function makeButton(name, handler) {
    if (name == 'Edit') return ui_1.ButtonWidget('Edit', handler, 'outline');
    if (name == 'Delete') return ui_1.ButtonWidget('Delete', handler, 'outline-danger');
    if (name == 'Save') return ui_1.ButtonWidget('Save', handler, 'outline');
    if (name == 'Cancel') return ui_1.ButtonWidget('Cancel', handler, 'outline-secondary');
    if (name == 'Create') return ui_1.ButtonWidget('Create', handler, 'outline');
    if (name == 'Close') return ui_1.ButtonWidget('Close', handler, 'outline');
    throw new Error('button not supported');
  }

  return shared_1.DomWidget(shared_1.container('<div class="d-flex justify-content-end"></div>')(config.map(([name, handler]) => makeButton(name, handler).dom.addClass('ml-2'))));
}

exports.ActionBarWidget = ActionBarWidget;
},{"../core/shared":"m0/6","./ui":"T2q6"}],"Jwlf":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");

function TableWidget(headerTitles, makeRowContent) {
  let values = [];
  const dom = $('<table class="table"></table>');

  function setAllValues(collection) {
    if (typeof collection === 'object') {
      values = Object.values(collection);
    } else {
      values = collection;
    }

    rebuildTable();
  }

  function rebuildTable() {
    dom.empty(); // headers

    dom.append(shared_1.container('<thead></thead>')(shared_1.container('<tr></tr>')(headerTitles.map(str => shared_1.container('<th scope="col"></th>')(str))))); // content

    dom.append(shared_1.container('<tbody></tbody>')(values.map(record => shared_1.container('<tr></tr>')(makeRowContent(record).map((rowContent, i) => shared_1.container('<td></td>')(typeof rowContent === 'string' ? document.createTextNode(rowContent) : rowContent))))));
  }

  rebuildTable();
  return {
    dom,
    setAllValues
  };
}

exports.TableWidget = TableWidget;
},{"../core/shared":"m0/6"}],"m0/6":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const server_1 = require("./server");

const Form_1 = require("../widgets/Form");

const Window_1 = require("../widgets/Window");

const ui_1 = require("../widgets/ui");

const ActionBar_1 = require("../widgets/ActionBar");

const Table_1 = require("../widgets/Table");

function MyTesting() {
  return 4;
}

exports.MyTesting = MyTesting;
/*

ALL BASIC CLASSES AND BASIC UTILS

*/
// This function converts mod numbers (ie. 11) into A-B-day strings (ie. 1B).
// The function is not used often because we expect users of the app to be able to
// work with the 1-20 mod notation.

function stringifyMod(mod) {
  if (1 <= mod && mod <= 10) {
    return String(mod) + 'A';
  } else if (11 <= mod && mod <= 20) {
    return String(mod - 10) + 'B';
  }

  throw new Error(`mod ${mod} isn't serializable`);
}

exports.stringifyMod = stringifyMod;

function stringifyError(error) {
  console.error(error);

  if (error instanceof Error) {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  }

  if (typeof error === 'object') {
    return JSON.stringify(error);
  }

  return error;
}

exports.stringifyError = stringifyError;

class Event {
  constructor() {
    this.listeners = [];
  }

  trigger() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  get chain() {
    return this.trigger.bind(this);
  }

  listen(cb) {
    this.listeners.push(cb);
  }

}

exports.Event = Event;

function container(newTag) {
  return (...children) => {
    if (Array.isArray(children[0])) {
      return $(newTag).append(children[0].map(x => typeof x === 'string' ? $(document.createTextNode(x)) : x));
    }

    return $(newTag).append(children.map(x => typeof x === 'string' ? $(document.createTextNode(x)) : x));
  };
}

exports.container = container;

function DomWidget(dom) {
  return {
    dom
  };
}

exports.DomWidget = DomWidget;

class ObservableState {
  constructor(initialValue) {
    this.val = initialValue;
    this.change = new Event(); // TODO: make sure this works

    this.change.trigger();
  }

  changeTo(val) {
    this.val = val;
    this.change.trigger();
  }

}

exports.ObservableState = ObservableState;

function generateStringOfMods(mods, modsPref) {
  return mods.map(mod => String(mod) + (modsPref.includes(mod) ? '*' : '')).join(', ');
}

exports.generateStringOfMods = generateStringOfMods;
/*

RESOURCES

*/

class ResourceEndpoint {
  constructor(name) {
    this.name = name;
  }

  askEndpoint(...partialArgs) {
    return __awaiter(this, void 0, void 0, function* () {
      return server_1.askServer([this.name].concat(partialArgs));
    });
  } // NOTE: ALL THESE RETURN PROMISES


  retrieveAll() {
    return this.askEndpoint('retrieveAll');
  }

  create(record) {
    return this.askEndpoint('create', record);
  }

  delete(id) {
    return this.askEndpoint('delete', id);
  }

  debug() {
    return this.askEndpoint('debug');
  }

  update(record) {
    return this.askEndpoint('update', record);
  }

}

exports.ResourceEndpoint = ResourceEndpoint;

class ResourceObservable extends ObservableState {
  constructor(endpoint) {
    super({
      status: server_1.AskStatus.ERROR,
      message: 'resource was not initialized properly'
    });
    this.endpoint = endpoint;
  }

  initialize() {
    return __awaiter(this, void 0, void 0, function* () {
      // If this fails, there will be some cascading failure throughout the app, but only when the resource is actually used. This prevents catastrophic failure the moment a resource fails.
      const newVal = yield this.endpoint.retrieveAll();
      this.changeTo(newVal);
      return newVal;
    });
  }

  getRecordOrFail(id) {
    const val = this.getLoadedOrFail();

    if (val[String(id)] === undefined) {
      throw new Error('record not available: ' + this.endpoint.name + '/#' + id);
    }

    return val[String(id)];
  }

  findRecordOrFail(id) {
    const val = this.getLoadedOrFail();

    if (val[String(id)] === undefined) {
      return null;
    }

    return val[String(id)];
  }

  getLoadedOrFail() {
    if (this.val.status != server_1.AskStatus.LOADED) {
      throw new Error('resource is not loaded: ' + this.endpoint.name);
    }

    return this.val.val;
  }

  forceRefresh() {
    return __awaiter(this, void 0, void 0, function* () {
      const newVal = yield this.endpoint.retrieveAll();
      this.changeTo(newVal);
    });
  }

  getRecordCollectionOrFail() {
    if (this.val.status == server_1.AskStatus.ERROR) {
      throw this.val.message;
    } else {
      return this.val.val;
    }
  }

  dependOnRecordOrFail(id) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.getRecordCollectionOrFail();
      return this.getRecordOrFail(id);
    });
  }

  updateRecord(record) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.val.status !== server_1.AskStatus.LOADED) {
        return this.val;
      }

      const ask = yield this.endpoint.update(record);

      if (ask.status == server_1.AskStatus.LOADED) {
        // update the client to match the server (sync)
        this.val.val[String(record.id)] = record;
        this.change.trigger();
      }

      return ask;
    });
  }

  createRecord(record) {
    return __awaiter(this, void 0, void 0, function* () {
      const ask = yield this.endpoint.create(record);

      if (this.val.status !== server_1.AskStatus.LOADED) {
        return this.val;
      }

      if (ask.status == server_1.AskStatus.LOADED) {
        // update the client to match the server (sync)
        this.val.val[String(ask.val.id)] = ask.val;
        this.change.trigger();
      }

      return ask;
    });
  }

  deleteRecord(id) {
    return __awaiter(this, void 0, void 0, function* () {
      const ask = yield this.endpoint.delete(id);

      if (ask.status == server_1.AskStatus.LOADED && this.val.status == server_1.AskStatus.LOADED) {
        // update the client to match the server (sync)
        delete this.val.val[String(id)];
        this.change.trigger();
      }

      return ask;
    });
  }

  onServerNotificationUpdate(record) {
    if (this.val.status === server_1.AskStatus.LOADED) {
      this.val.val[String(record.id)] = record;
      this.change.trigger();
    }
  }

  onServerNotificationCreate(record) {
    if (this.val.status === server_1.AskStatus.LOADED) {
      this.val.val[String(record.id)] = record;
      this.change.trigger();
    }
  }

  onServerNotificationDelete(id) {
    if (this.val.status === server_1.AskStatus.LOADED) {
      delete this.val.val[String(id)];
      this.change.trigger();
    }
  }

}

exports.ResourceObservable = ResourceObservable;

class Resource {
  constructor(name, info) {
    this.name = name;
    this.endpoint = new ResourceEndpoint(this.name);
    this.state = new ResourceObservable(this.endpoint);
    this.info = info;
  }

  makeFormWidget() {
    return Form_1.FormWidget(this.info.fields);
  }

  createMarker(id, builder, onClick = () => this.makeTiledEditWindow(id)) {
    return ui_1.createMarkerLink(this.createLabel(id, builder), onClick);
  }

  createLabel(id, builder) {
    try {
      const record = this.state.getRecordOrFail(id);
      return builder.call(null, record);
    } catch (e) {
      console.error(e);
      return '(??? UNKNOWN ???)';
    }
  } // The edit window is kind of combined with the view window.


  makeTiledEditWindow(id) {
    return __awaiter(this, void 0, void 0, function* () {
      let record = null;
      let errorMessage = '';

      try {
        function capitalizeWord(w) {
          return w.charAt(0).toUpperCase() + w.slice(1);
        }

        yield this.state.getRecordCollectionOrFail();
        record = this.state.getRecordOrFail(id);
        const windowLabel = capitalizeWord(this.info.title) + ': ' + this.createLabel(id, this.info.makeLabel);
        const form = this.makeFormWidget();
        form.setAllValues(record);
        const {
          closeWindow
        } = Window_1.useTiledWindow(container('<div></div>')(container('<h1></h1>')(windowLabel), form.dom), ActionBar_1.ActionBarWidget([['Delete', () => this.makeTiledDeleteWindow(id, () => closeWindow())], ['Save', () => __awaiter(this, void 0, void 0, function* () {
          closeWindow();
          const ask = yield this.state.updateRecord(form.getAllValues());

          if (ask.status === server_1.AskStatus.ERROR) {
            alert(stringifyError(ask.message));
          }
        })], ['Close', () => closeWindow()]]).dom, windowLabel);
      } catch (err) {
        const windowLabel = 'ERROR in: ' + this.info.title + ' #' + id;
        errorMessage = stringifyError(err);
        const {
          closeWindow
        } = Window_1.useTiledWindow(ui_1.ErrorWidget(errorMessage).dom, ActionBar_1.ActionBarWidget([['Close', () => closeWindow()]]).dom, windowLabel);
      }
    });
  }

  makeTiledCreateWindow() {
    return __awaiter(this, void 0, void 0, function* () {
      let errorMessage = '';

      try {
        yield this.state.getRecordCollectionOrFail();
        const windowLabel = 'Create new ' + this.info.title;
        const form = this.makeFormWidget();
        form.setAllValues({
          id: -1,
          date: Date.now()
        });
        const {
          closeWindow
        } = Window_1.useTiledWindow(container('<div></div>')(container('<h1></h1>')(windowLabel), form.dom), ActionBar_1.ActionBarWidget([['Create', () => __awaiter(this, void 0, void 0, function* () {
          const ask = yield this.state.createRecord(form.getAllValues());

          if (ask.status === server_1.AskStatus.ERROR) {
            alert('ERROR!\n' + stringifyError(ask.message));
          }

          closeWindow();
        })], ['Close', () => closeWindow()]]).dom, windowLabel);
      } catch (err) {
        const windowLabel = 'ERROR in: create new ' + this.info.title;
        errorMessage = stringifyError(err);
        const {
          closeWindow
        } = Window_1.useTiledWindow(ui_1.ErrorWidget(errorMessage).dom, ActionBar_1.ActionBarWidget([['Close', () => closeWindow()]]).dom, windowLabel);
      }
    });
  }

  makeTiledViewAllWindow() {
    return __awaiter(this, void 0, void 0, function* () {
      let recordCollection = null;
      let errorMessage = '';

      try {
        const onLoad = new Event();
        recordCollection = yield this.state.getRecordCollectionOrFail();
        const table = Table_1.TableWidget(this.info.tableFieldTitles.concat('View'), record => this.info.makeTableRowContent(record).concat(ui_1.ButtonWidget('View', () => {
          closeThisWindow();
          this.makeTiledEditWindow(record.id);
        }).dom));
        onLoad.listen(() => {
          recordCollection = this.state.getLoadedOrFail();
          table.setAllValues(recordCollection);
        });
        const windowLabel = 'View all ' + this.info.pluralTitle;
        const {
          closeWindow
        } = Window_1.useTiledWindow(container('<div></div>')(container('<h1></h1>')(windowLabel), table.dom), ActionBar_1.ActionBarWidget([['Create', () => this.makeTiledCreateWindow()], ['Close', () => closeWindow()]]).dom, windowLabel, onLoad);

        function closeThisWindow() {
          closeWindow();
        }
      } catch (err) {
        errorMessage = stringifyError(err);
        const windowLabel = 'ERROR in: view all ' + this.info.pluralTitle;
        const {
          closeWindow
        } = Window_1.useTiledWindow(ui_1.ErrorWidget(errorMessage).dom, ActionBar_1.ActionBarWidget([['Create', () => this.makeTiledCreateWindow()], ['Close', () => closeWindow()]]).dom, windowLabel);
      }
    });
  }

  makeTiledDeleteWindow(id, closeParentWindow) {
    const windowLabel = 'Delete this ' + this.info.title + '? (' + this.createLabel(id, record => record.friendlyFullName) + ')';
    const {
      windowWidget,
      closeWindow
    } = Window_1.useTiledWindow(container('<div></div>')(container('<h1></h1>')('Delete?'), container('<p></p>')('Are you sure you want to delete this?')), ActionBar_1.ActionBarWidget([['Delete', () => this.state.deleteRecord(id).then(() => closeParentWindow()).then(() => closeWindow()).then(() => alert('Deletion successful!'))], ['Cancel', () => closeWindow]]).dom, windowLabel);
    return windowWidget;
  }

}

exports.Resource = Resource;
/*

IMPORTANT GLOBALS

*/

exports.state = {
  tiledWindows: new ObservableState([])
};
/*

WINDOW-RELATED GLOBAL METHODS

*/

function addWindow(window, windowKey, title, onLoad) {
  // The onLoad event is triggered BEFORE the window is added. If the first onLoad call fails, no window will be created.
  onLoad.trigger();
  exports.state.tiledWindows.val.push({
    key: windowKey,
    window,
    visible: true,
    title,
    onLoad
  });

  for (const window of exports.state.tiledWindows.val) {
    if (window.key === windowKey) {
      window.visible = true;
    } else {
      // you can't have two visible windows at once
      // so, hide all other windows
      window.visible = false;
    }
  }

  exports.state.tiledWindows.change.trigger();
}

exports.addWindow = addWindow;

function removeWindow(windowKey) {
  // MEMORY LEAK PREVENTION: explicitly null out the onLoad event when the whole window is deleted
  for (const window of exports.state.tiledWindows.val) {
    if (window.key === windowKey) {
      window.onLoad = null;
    }
  }

  exports.state.tiledWindows.val = exports.state.tiledWindows.val.filter(({
    key
  }) => key !== windowKey);
  exports.state.tiledWindows.change.trigger();
}

exports.removeWindow = removeWindow;

function hideWindow(windowKey) {
  for (const window of exports.state.tiledWindows.val) {
    if (window.key === windowKey) {
      window.visible = false;
    }
  }

  exports.state.tiledWindows.change.trigger();
}

exports.hideWindow = hideWindow;

function showWindow(windowKey) {
  for (const window of exports.state.tiledWindows.val) {
    if (window.key === windowKey) {
      window.visible = true;
    } else {
      // you can't have two visible windows at once
      // so, hide all other windows
      window.visible = false;
    }
  }

  exports.state.tiledWindows.change.trigger(); // trigger the onload event
  // TODO: removed the event for now, and might add back in later

  /*for (const window of state.tiledWindows.val) {
      if (window.key === windowKey) {
          window.onLoad.trigger();
      }
  }*/
}

exports.showWindow = showWindow;

function processResourceInfo(conf) {
  let fields = [];

  for (const [name, type] of conf.fields) {
    fields.push({
      title: conf.fieldNameMap[name],
      name,
      type
    });
  }

  fields = fields.concat([{
    title: 'ID',
    name: 'id',
    type: ui_1.NumberField('number')
  }, {
    title: 'Date',
    name: 'date',
    type: ui_1.NumberField('datetime-local')
  }]);
  return {
    fields,
    makeTableRowContent: conf.makeTableRowContent,
    title: conf.title,
    pluralTitle: conf.pluralTitle,
    tableFieldTitles: conf.tableFieldTitles,
    makeLabel: conf.makeLabel
  };
}

exports.processResourceInfo = processResourceInfo;

function makeBasicStudentConfig() {
  return [['firstName', ui_1.StringField('text')], ['lastName', ui_1.StringField('text')], ['friendlyName', ui_1.StringField('text')], ['friendlyFullName', ui_1.StringField('text')], ['grade', ui_1.NumberField('number')], ['studentId', ui_1.NumberField('number')], ['email', ui_1.StringField('email')], ['phone', ui_1.StringField('string')], ['contactPref', ui_1.SelectField(['email', 'phone', 'either'], ['Email', 'Phone', 'Either'])]];
}

exports.makeBasicStudentConfig = makeBasicStudentConfig;
const fieldNameMap = {
  firstName: 'First name',
  lastName: 'Last name',
  friendlyName: 'Friendly name',
  friendlyFullName: 'Friendly full name',
  grade: 'Grade',
  learner: 'Learner',
  tutor: 'Tutor',
  status: 'Status',
  mods: 'Mods',
  mod: 'Mod',
  modsPref: 'Preferred mods',
  subjectList: 'Subjects',
  request: 'Request',
  subject: 'Subject(s)',
  studentId: 'Student ID',
  email: 'Email',
  phone: 'Phone',
  contactPref: 'Contact preference',
  specialRoom: 'Special tutoring room'
};
const tutorsInfo = {
  fields: [...makeBasicStudentConfig(), ['mods', ui_1.NumberArrayField('number')], ['modsPref', ui_1.NumberArrayField('number')], ['subjectList', ui_1.StringField('text')]],
  fieldNameMap,
  tableFieldTitles: ['Name', 'Grade', 'Mods', 'Subjects'],
  makeTableRowContent: record => [exports.tutors.createMarker(record.id, x => x.friendlyFullName), record.grade, generateStringOfMods(record.mods, record.modsPref), record.subjectList],
  title: 'tutor',
  pluralTitle: 'tutors',
  makeLabel: record => record.friendlyFullName
};
const learnersInfo = {
  fields: [...makeBasicStudentConfig()],
  fieldNameMap,
  tableFieldTitles: ['Name', 'Grade'],
  makeTableRowContent: record => [exports.learners.createMarker(record.id, x => x.friendlyFullName), record.grade],
  title: 'learner',
  pluralTitle: 'learners',
  makeLabel: record => record.friendlyFullName
};
const requestsInfo = {
  fields: [['learner', ui_1.NumberField('id')], ['mods', ui_1.NumberArrayField('number')], ['subject', ui_1.StringField('text')], ['specialRoom', ui_1.StringField('text')]],
  fieldNameMap,
  tableFieldTitles: ['Learner', 'Subject', 'Mods'],
  makeTableRowContent: record => [exports.learners.createMarker(record.learner, x => x.friendlyFullName), record.subject, record.mods.join(', ')],
  title: 'request',
  pluralTitle: 'requests',
  makeLabel: record => exports.learners.createLabel(record.learner, x => x.friendlyFullName)
};
const bookingsInfo = {
  fields: [['request', ui_1.NumberField('id')], ['tutor', ui_1.NumberField('id')], ['mod', ui_1.NumberField('number')], ['status', ui_1.SelectField(['unsent', 'waitingForTutor', 'waitingForLearner', 'finalized', 'rejected', 'rejectedByTutor', 'rejectedByLearner'], ['Unsent', 'Waiting for tutor', 'Waiting for learner', 'Finalized', 'Rejected', 'Rejected by tutor', 'Rejected by learner'])]],
  fieldNameMap,
  tableFieldTitles: ['Learner', 'Tutor', 'Mod', 'Status'],
  makeTableRowContent: record => [exports.learners.createMarker(exports.requests.state.getRecordOrFail(record.request).learner, x => x.friendlyFullName), exports.tutors.createMarker(record.tutor, x => x.friendlyFullName), record.mod, record.status],
  title: 'booking',
  pluralTitle: 'bookings',
  makeLabel: record => exports.tutors.state.getRecordOrFail(record.tutor).friendlyFullName + ' <> ' + exports.learners.state.getRecordOrFail(exports.requests.state.getRecordOrFail(record.request).learner).friendlyFullName
};
const matchingsInfo = {
  fields: [['learner', ui_1.StringField('text')], ['tutor', ui_1.StringField('text')], ['subject', ui_1.StringField('text')], ['mod', ui_1.NumberField('number')], ['status', ui_1.SelectField(['unwritten', 'unsent', 'finalized'], ['Unwritten', 'Unsent', 'Finalized'])], ['specialRoom', ui_1.StringField('text')]],
  fieldNameMap,
  tableFieldTitles: ['Learner', 'Tutor', 'Mod', 'Subject', 'Status'],
  makeTableRowContent: record => [exports.learners.createMarker(record.learner, x => x.friendlyFullName), exports.tutors.createMarker(record.tutor, x => x.friendlyFullName), record.mod, record.subject, record.status],
  title: 'matching',
  pluralTitle: 'matchings',
  makeLabel: record => exports.tutors.state.getRecordOrFail(record.tutor).friendlyFullName + ' <> ' + exports.learners.state.getRecordOrFail(record.learner).friendlyFullName
};
const requestSubmissionsInfo = {
  fields: [...makeBasicStudentConfig(), ['mods', ui_1.NumberArrayField('number')], ['subject', ui_1.StringField('text')], ['specialRoom', ui_1.StringField('text')], ['status', ui_1.StringField('text')]],
  fieldNameMap,
  tableFieldTitles: ['Name', 'Mods', 'Subject'],
  makeTableRowContent: record => [record.friendlyFullName, record.mods.join(', '), record.subject],
  title: 'request submission',
  pluralTitle: 'request submissions',
  makeLabel: record => record.friendlyFullName
};
exports.tutors = new Resource('tutors', processResourceInfo(tutorsInfo));
exports.learners = new Resource('learners', processResourceInfo(learnersInfo));
exports.requests = new Resource('requests', processResourceInfo(requestsInfo));
exports.bookings = new Resource('bookings', processResourceInfo(bookingsInfo));
exports.matchings = new Resource('matchings', processResourceInfo(matchingsInfo));
exports.requestSubmissions = new Resource('requestSubmissions', processResourceInfo(requestSubmissionsInfo));

function initializeResources() {
  return __awaiter(this, void 0, void 0, function* () {
    yield exports.tutors.state.initialize();
    yield exports.learners.state.initialize();
    yield exports.bookings.state.initialize();
    yield exports.matchings.state.initialize();
    yield exports.requests.state.initialize();
    yield exports.requestSubmissions.state.initialize();
  });
}

exports.initializeResources = initializeResources;

window['appDebug'] = () => ({
  tutors: exports.tutors,
  learners: exports.learners,
  bookings: exports.bookings,
  matchings: exports.matchings,
  requests: exports.requests,
  requestSubmissions: exports.requestSubmissions
});
},{"./server":"ZgGC","../widgets/Form":"IhYu","../widgets/Window":"8cu6","../widgets/ui":"T2q6","../widgets/ActionBar":"DVx/","../widgets/Table":"Jwlf"}],"5dK+":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");

function TilingWindowManagerWidget() {
  const tiledWindows = shared_1.state.tiledWindows;
  const dom = $('<div></div>');
  const domWindowKeys = [];
  tiledWindows.change.listen(() => {
    // STEP A: REMOVE/ADD WINDOWS
    const state = tiledWindows.val; // The windows we want to keep are the ones in the state.

    const windowsToKeep = {};

    for (const {
      key
    } of state) windowsToKeep[key] = true;

    let childIndex = 0;

    while (childIndex < dom.children().length) {
      if (!windowsToKeep[domWindowKeys[childIndex]]) {
        // remove this child: we do NOT increment childIndex
        // because the next child will take the place of the
        // current one
        dom.children()[childIndex].remove(); // this resyncs domWindowKeys with the DOM

        domWindowKeys.splice(childIndex, 1);
      } else {
        // take a look at the next child
        ++childIndex;
      }
    } // we assume there might be ONE new window at the end of tiledWindows


    if (state.length > 0) {
      const windowsInDom = {};

      for (const key of domWindowKeys) windowsInDom[key] = true;

      if (!windowsInDom[state[state.length - 1].key]) {
        // add it in to the end!
        dom.append(state[state.length - 1].window.dom); // this resyncs domWindowKeys with the DOM

        domWindowKeys.push(state[state.length - 1].key);
      }
    } // STEP B: SET VISIBILITIES
    // By now, we assume that domWindowKeys and tiledWindows are in sync


    for (let i = 0; i < state.length; ++i) {
      if (state[i].visible) {
        $(dom.children()[i]).show();
      } else {
        $(dom.children()[i]).hide();
      }
    }
  });
  return shared_1.DomWidget(dom);
}

exports.TilingWindowManagerWidget = TilingWindowManagerWidget;
},{"../core/shared":"m0/6"}],"fk88":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");

const ui_1 = require("./ui");

function WindowsBarWidget() {
  const s = shared_1.state.tiledWindows;
  const dom = $('<div></div>');

  function makeButton({
    key,
    title,
    visible
  }) {
    const closeButton = ui_1.ButtonWidget('(X)', () => shared_1.removeWindow(key), visible ? 'outline-primary' : 'outline-secondary').dom;
    const mainButton = ui_1.ButtonWidget(shared_1.container('<span style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"></span>')('Window: ' + title, closeButton), () => visible ? shared_1.hideWindow(key) : shared_1.showWindow(key), visible ? 'primary' : 'outline-secondary').dom;
    return shared_1.container('<div class="btn-group d-inline-block mr-3"></div>')(mainButton, closeButton);
  }

  s.change.listen(() => {
    dom.empty();
    dom.append(s.val.map(makeButton));
  });
  return shared_1.DomWidget(dom);
}

exports.WindowsBarWidget = WindowsBarWidget;
},{"../core/shared":"m0/6","./ui":"T2q6"}],"o4ND":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("./shared");

const ui_1 = require("../widgets/ui");

const TilingWindowManager_1 = require("../widgets/TilingWindowManager");

const WindowsBar_1 = require("../widgets/WindowsBar");

const Window_1 = require("../widgets/Window");

const Table_1 = require("../widgets/Table");

const ActionBar_1 = require("../widgets/ActionBar");

const server_1 = require("./server");
/*

BASIC UTILITIES

*/


function isOperationConfirmedByUser(args) {
  return __awaiter(this, void 0, void 0, function* () {
    return new Promise(res => __awaiter(this, void 0, void 0, function* () {
      const body = shared_1.container('<div></div>')($('<p><strong>This operation will do the following:</strong></p>'), shared_1.container('<ul></ul>')(args.thisOpDoes.map(x => shared_1.container('<li></li>')(x))), $('<p><strong>Make sure that:</strong></p>'), shared_1.container('<ul></ul>')(args.makeSureThat.map(x => shared_1.container('<li></li>')(x))));
      yield ui_1.showModal('Are you sure?', body, bb => [bb('Cancel', 'outline-secondary'), bb('Go ahead', 'primary', () => res(true))]);
      res(false);
    }));
  });
}

const pillsString = `
<ul class="nav nav-pills">
    <li class="nav-item">
        <a class="nav-link">Tutors</a>
    </li>
    <li class="nav-item">
        <a class="nav-link">Learners</a>
    </li>
    <li class="nav-item">
        <a class="nav-link">Requests</a>
    </li>
    <li class="nav-item">
        <a class="nav-link">Request submissions</a>
    </li>
    <li class="nav-item">
        <a class="nav-link">Bookings</a>
    </li>
    <li class="nav-item">
        <a class="nav-link">Matchings</a>
    </li>
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-toggle="dropdown">Steps</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item">Check request submissions</a>
            <a class="dropdown-item">Handle requests and bookings</a>
            <a class="dropdown-item">Finalize matchings</a>
        </div>
    </li>
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-toggle="dropdown">Other</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item">About</a>
            <a class="dropdown-item">Force refresh</a>
        </div>
    </li>
</ul>`;

function simpleStepWindow(defaultWindowLabel, makeContent) {
  return __awaiter(this, void 0, void 0, function* () {
    if (typeof defaultWindowLabel === 'string') defaultWindowLabel = shared_1.container('<span></span>')(defaultWindowLabel);
    let errorMessage = '';

    try {
      const {
        closeWindow
      } = Window_1.useTiledWindow(shared_1.container('<div></div>')(shared_1.container('<h1></h1>')(defaultWindowLabel), makeContent(() => closeWindow)), ActionBar_1.ActionBarWidget([['Close', () => closeWindow()]]).dom, defaultWindowLabel.text());
    } catch (err) {
      const windowLabel = 'ERROR in: ' + defaultWindowLabel.text();
      errorMessage = shared_1.stringifyError(err);
      const {
        closeWindow
      } = Window_1.useTiledWindow(ui_1.ErrorWidget(errorMessage).dom, ActionBar_1.ActionBarWidget([['Close', () => closeWindow()]]).dom, windowLabel);
    }
  });
}
/*

STEPS

*/


function checkRequestSubmissionsStep() {
  return __awaiter(this, void 0, void 0, function* () {
    yield simpleStepWindow('New request submissions', closeWindow => {
      const recordCollection = shared_1.requestSubmissions.state.getRecordCollectionOrFail();
      const table = Table_1.TableWidget(['Name', 'Convert into request'], record => {
        function attemptConversion() {
          return __awaiter(this, void 0, void 0, function* () {
            // CREATE LEARNER
            // try to dig up a learner with matching student ID, which would mean
            // that the learner already exists in the database
            const matches = Object.values(shared_1.learners.state.getRecordCollectionOrFail()).filter(x => x.studentId === record.studentId);
            let learnerRecord;

            if (matches.length > 1) {
              // duplicate learner student IDs??
              // this should be validated in the database
              throw new Error(`duplicate student id: "${record.studentId}"`);
            } else if (matches.length == 0) {
              // create new learner
              learnerRecord = server_1.getResultOrFail((yield shared_1.learners.state.createRecord({
                firstName: record.firstName,
                lastName: record.lastName,
                friendlyName: record.friendlyName,
                friendlyFullName: record.friendlyFullName,
                grade: record.grade,
                id: -1,
                date: -1,
                studentId: record.studentId,
                email: record.email,
                phone: record.phone,
                contactPref: record.contactPref
              })));
            } else {
              // learner already exists
              learnerRecord = matches[0];
            } // CREATE REQUEST


            server_1.getResultOrFail((yield shared_1.requests.state.createRecord({
              learner: learnerRecord.id,
              id: -1,
              date: -1,
              mods: record.mods,
              subject: record.subject,
              specialRoom: record.specialRoom
            }))); // MARK REQUEST SUBMISSION AS CHECKED
            // NOTE: this is only done if the above steps worked
            // so if there's an error, the request submission won't be obliterated

            record.status = 'checked';
            server_1.getResultOrFail((yield shared_1.requestSubmissions.state.updateRecord(record)));
          });
        }

        return [shared_1.requestSubmissions.createMarker(record.id, x => x.friendlyFullName), ui_1.ButtonWidget('Convert', () => __awaiter(this, void 0, void 0, function* () {
          if (yield isOperationConfirmedByUser({
            thisOpDoes: [`Creates a learner if he/she doesn't already exist in the app`, `Converts the "request submission" into a "request" and deletes the original`],
            makeSureThat: [`Request submission information is accurate and correctly spelled`]
          })) {
            try {
              closeWindow()();
              yield attemptConversion();
            } catch (err) {
              alert(shared_1.stringifyError(err));
            }
          }
        })).dom];
      });
      table.setAllValues(Object.values(recordCollection).filter(x => x.status === 'unchecked'));
      return table.dom;
    });
  });
}

function handleRequestsAndBookingsStep() {
  return __awaiter(this, void 0, void 0, function* () {
    yield simpleStepWindow('Requests & bookings', closeWindow => {
      const learnerRecords = shared_1.learners.state.getRecordCollectionOrFail();
      const bookingRecords = shared_1.bookings.state.getRecordCollectionOrFail();
      const matchingRecords = shared_1.matchings.state.getRecordCollectionOrFail();
      const requestRecords = shared_1.requests.state.getRecordCollectionOrFail();
      const table = Table_1.TableWidget(['Request', 'Current status', 'Open booker'], i => {
        return [shared_1.requests.createMarker(i.id, x => shared_1.learners.createLabel(x.learner, y => y.friendlyFullName)), i.currentStatus, ui_1.ButtonWidget('Open', () => {
          closeWindow()();
          showRequestBookerStep(i.id);
        }).dom];
      }); // INDEX: learners --> { requests, isMatched }

      const learnersIndex = {};

      for (const x of Object.values(learnerRecords)) {
        learnersIndex[x.id] = {
          isMatched: false
        };
      }

      for (const x of Object.values(matchingRecords)) {
        learnersIndex[String(x.learner)].isMatched = true;
      } // INDEX: requests --> { bookings, matchings, shouldBeOnPage }


      const requestsIndex = {};

      for (const x of Object.values(requestRecords)) {
        requestsIndex[String(x.id)] = {
          id: x.id,
          bookings: [],
          matchings: [],
          // "Current status" isn't actually a status directly from the database: it's just holds the string that is put on the UI
          currentStatus: 'Unbooked'
        };
      } // ALL INDEXES ARE FULLY BUILT BY THIS POINT
      // Don't show requests with an already-matched learner.


      for (const x of Object.values(requestRecords)) {
        if (learnersIndex[String(x.learner)].isMatched) {
          requestsIndex[String(x.id)].currentStatus = 'Matched';
        }
      } // If a request has more than one booking, mark it as either status "Waiting" or "Unsent"


      for (const x of Object.values(bookingRecords)) {
        const y = requestsIndex[String(x.request)];
        if (y.currentStatus == 'Matched') continue;

        if (x.status == 'unsent') {
          y.currentStatus = 'unsent';
        }

        if (y.currentStatus == 'Unsent') continue;

        if (x.status.startsWith('waiting')) {
          y.currentStatus = 'Waiting';
        }
      }

      table.setAllValues(Object.values(requestsIndex).filter(x => x.currentStatus !== 'Matched'));
      return table.dom;
    });
  });
}

function showRequestBookerStep(requestId) {
  return __awaiter(this, void 0, void 0, function* () {
    yield simpleStepWindow('Booker for ' + shared_1.learners.createLabel(shared_1.requests.state.getRecordOrFail(requestId).learner, x => x.friendlyFullName), closeWindow => {
      const matchingRecords = shared_1.matchings.state.getRecordCollectionOrFail();
      const bookingRecords = shared_1.bookings.state.getRecordCollectionOrFail();
      const tutorRecords = shared_1.tutors.state.getRecordCollectionOrFail();
      const table = Table_1.TableWidget(['Booking', 'Mark as...', 'Todo', 'Finalize'], booking => {
        const formSelectWidget = ui_1.FormSelectWidget(['unsent', 'waitingForTutor', 'waitingForLearner', 'rejectedByTutor', 'rejectedByLearner', 'rejected'], ['Unsent', 'Waiting for tutor', 'Waiting for learner', 'Rejected by tutor', 'Rejected by learner', 'Rejected for other reason']);
        formSelectWidget.setValue(booking.status);
        formSelectWidget.onChange(newVal => __awaiter(this, void 0, void 0, function* () {
          booking.status = newVal;
          const response = yield shared_1.bookings.state.updateRecord(booking);

          if (response.status === server_1.AskStatus.ERROR) {
            alert('ERROR!\n' + response.message);
          }
        }));
        return [shared_1.tutors.createLabel(booking.tutor, x => x.friendlyFullName) + ' <> ' + shared_1.learners.createLabel(shared_1.requests.state.getRecordOrFail(booking.request).learner, x => x.friendlyFullName), formSelectWidget.dom, ui_1.ButtonWidget('Todo', () => showBookingMessagerStep(booking.id)).dom, ui_1.ButtonWidget('Finalize', () => {
          finalizeBookingsStep(booking.id, closeWindow());
        }).dom];
      }); // LOGIC: We use a toggle structure where:
      // - There is a row of mod buttons
      // - There is add functionality, but not delete functionality (bookings can be individually deleted)
      // - Toggling the button toggles entries in a temporary array of all added bookings [[tutor, mod]] via. filters
      // - Clicking "Save your bookings" will write to the database

      let bookingsInfo = [];
      const potentialTable = Table_1.TableWidget(['Tutor', '# times booked', 'Book for mods...'], ({
        tutorId,
        mods,
        numBookings
      }) => {
        const buttonsDom = $('<div></div>');

        for (const {
          mod,
          isPref,
          isAlreadyBooked
        } of mods) {
          const modLabel = mod + (isPref ? '*' : '');

          if (isAlreadyBooked) {
            buttonsDom.append(ui_1.ButtonWidget(modLabel + ' (already booked)', () => {}).dom);
            continue;
          }

          const w = ui_1.FormToggleWidget(modLabel, 'Unbook ' + modLabel);
          w.setValue(false);
          w.onChange(newVal => {
            if (newVal) {
              bookingsInfo.push({
                tutorId,
                mod
              });
            } else {
              bookingsInfo = bookingsInfo.filter(x => x.tutorId !== tutorId || x.mod !== mod);
            }
          });
          buttonsDom.append(w.dom);
        }

        return [shared_1.tutors.createMarker(tutorId, x => x.friendlyFullName), String(numBookings), buttonsDom];
      });
      const saveBookingsButton = ui_1.ButtonWidget('Save your bookings', () => __awaiter(this, void 0, void 0, function* () {
        try {
          for (const {
            tutorId,
            mod
          } of bookingsInfo) {
            closeWindow()();
            const ask = yield shared_1.bookings.state.createRecord({
              id: -1,
              date: -1,
              tutor: tutorId,
              mod,
              request: requestId,
              status: 'unsent'
            });

            if (ask.status === server_1.AskStatus.ERROR) {
              throw ask.message;
            }
          }
        } catch (err) {
          alert(err);
        }
      }));
      table.setAllValues(Object.values(shared_1.bookings.state.getRecordCollectionOrFail()).filter(x => x.request === requestId).map(x => shared_1.bookings.state.getRecordOrFail(x.id))); // LOGIC: calculating which tutors work for this request
      // - tutor must not be matched at the target mod
      // - tutor may be matched to another mod
      // - for each tutor, keep track of which mods they've been matched to
      // - SENDS TO TABLE: [ tutorId, [ mod, isPref: boolean ] ]

      const requestRecord = shared_1.requests.state.getRecordOrFail(requestId);
      const tutorIndex = {};

      for (const x of Object.values(tutorRecords)) {
        tutorIndex[String(x.id)] = {
          id: x.id,
          matchedMods: [],
          bookedMods: []
        };
      }

      for (const x of Object.values(matchingRecords)) {
        tutorIndex[String(x.tutor)].matchedMods.push(x.mod);
      }

      for (const x of Object.values(bookingRecords)) {
        tutorIndex[String(x.tutor)].bookedMods.push(x.mod);
      }

      const tableValues = [];

      for (const tutor of Object.values(tutorIndex)) {
        const modResults = [];

        for (const mod of requestRecord.mods) {
          if (!tutor.matchedMods.includes(mod)) {
            const tutorRecord = shared_1.tutors.state.getRecordOrFail(tutor.id);

            if (tutorRecord.mods.includes(mod)) {
              modResults.push({
                mod,
                isPref: tutorRecord.modsPref.includes(mod),
                isAlreadyBooked: tutor.bookedMods.includes(mod)
              });
            }
          }
        }

        if (modResults.length > 0) {
          tableValues.push({
            tutorId: tutor.id,
            mods: modResults,
            numBookings: tutor.bookedMods.length
          });
        }
      }

      potentialTable.setAllValues(tableValues);
      return shared_1.container('<div></div>')(table.dom, potentialTable.dom, saveBookingsButton.dom);
    });
  });
}

function showBookingMessagerStep(bookingId) {
  return __awaiter(this, void 0, void 0, function* () {
    const b = shared_1.bookings.state.getRecordOrFail(bookingId);
    const r = shared_1.requests.state.getRecordOrFail(b.request);
    yield simpleStepWindow(shared_1.container('<span></span>')('Messager for ', shared_1.learners.createMarker(r.learner, x => x.friendlyFullName), ' <> ', shared_1.tutors.createMarker(b.tutor, x => x.friendlyFullName)), closeWindow => {
      const dom = $('<div></div>');

      if (b.status === 'unsent') {
        dom.append($('<p>Because status is "unsent", send the message to the tutor:</p>'));
        dom.append(ui_1.MessageTemplateWidget(`Hi! Can you tutor a student in ${r.subject} on mod ${shared_1.stringifyMod(b.mod)}?`).dom);
        dom.append($('<p>Once you send the message, go back and set the status to "waiting for tutor".</p>'));
      }

      if (b.status === 'waitingForTutor') {
        dom.append($('<p>You are waiting for the tutor. Once the tutor replies, send a message to the learner:</p>'));
        dom.append(ui_1.MessageTemplateWidget(`Hi! We have a tutor for you on mod ${shared_1.stringifyMod(b.mod)}. Can you come?`).dom);
        dom.append($('<p>Once you send the message, go back and set the status to "waiting for learner".</p>'));
      }

      if (b.status === 'waitingForLearner') {
        dom.append($('<p>You are waiting for the learner. Once the learner replies, if everything is good, go back and click "finalize".</p>'));
      }

      return dom;
    });
  });
}

function finalizeBookingsStep(bookingId, onVerify) {
  return __awaiter(this, void 0, void 0, function* () {
    if (yield isOperationConfirmedByUser({
      thisOpDoes: ['Assigns the tutor to the learner, replacing the booking with a matching (this can be undone by deleting the matching and rebooking)', 'Deletes all other bookings associated with the learner'],
      makeSureThat: ['The tutor and learner really should be matched']
    })) {
      onVerify();

      try {
        const b = shared_1.bookings.state.getRecordOrFail(bookingId);
        const r = shared_1.requests.state.getRecordOrFail(b.request); // ADD MATCHING

        const ask = yield shared_1.matchings.state.createRecord({
          learner: r.learner,
          tutor: b.tutor,
          subject: r.subject,
          mod: b.mod,
          status: 'unwritten',
          specialRoom: r.specialRoom,
          id: -1,
          date: -1
        });

        if (ask.status === server_1.AskStatus.ERROR) {
          throw ask.message;
        } // DELETE ALL BOOKINGS FOR REQUEST


        for (const booking of Object.values(shared_1.bookings.state.getRecordCollectionOrFail())) {
          if (booking.request === r.id) {
            const ask2 = yield shared_1.bookings.state.deleteRecord(booking.id);

            if (ask2.status === server_1.AskStatus.ERROR) {
              throw ask2.message;
            }
          }
        }
      } catch (err) {
        alert(shared_1.stringifyError(err));
      }

      return true;
    } else {
      return false;
    }
  });
}

function finalizeMatchingsStep() {
  return __awaiter(this, void 0, void 0, function* () {
    yield simpleStepWindow('Finalize matchings', closeWindow => {
      const table = Table_1.TableWidget(['Matching', 'Status', 'Write', 'Finalize'], record => {
        const formSelectWidget = ui_1.FormSelectWidget(['unwritten', 'unsent', 'unfinalized'], ['Unwritten', 'Unsent', 'Unfinalized']);
        formSelectWidget.setValue(record.status);
        formSelectWidget.onChange(newVal => __awaiter(this, void 0, void 0, function* () {
          record.status = newVal;
          const response = yield shared_1.matchings.state.updateRecord(record);

          if (response.status === server_1.AskStatus.ERROR) {
            alert('ERROR!\n' + response.message);
          }
        }));
        return [shared_1.learners.createLabel(record.learner, x => x.friendlyFullName) + '<>' + shared_1.tutors.createLabel(record.tutor, x => x.friendlyFullName), formSelectWidget.dom, ui_1.ButtonWidget('Send', () => {
          showMatchingSender(record.id);
        }).dom, ui_1.ButtonWidget('Finalize', () => {
          finalizeMatching(record.id, closeWindow());
        }).dom];
      });
      const records = Object.values(shared_1.matchings.state.getRecordCollectionOrFail());
      table.setAllValues(records.filter(x => x.status !== 'finalized'));
      return table.dom;
    });
  });
}

function showMatchingSender(matchingId) {
  return __awaiter(this, void 0, void 0, function* () {
    const m = shared_1.matchings.state.getRecordOrFail(matchingId);
    yield simpleStepWindow(shared_1.container('<span></span>')('Send matching: ', shared_1.learners.createMarker(m.learner, x => x.friendlyFullName), ' <> ', shared_1.tutors.createMarker(m.tutor, x => x.friendlyFullName)), closeWindow => {
      const t = shared_1.tutors.state.getRecordOrFail(m.tutor);
      const l = shared_1.learners.state.getRecordOrFail(m.learner);
      return shared_1.container('<div></div>')('Send this to the learner.', ui_1.MessageTemplateWidget(`You will be tutored by ${t.friendlyFullName} during mod ${shared_1.stringifyMod(m.mod)}.`).dom, 'Then, send this to the tutor.', ui_1.MessageTemplateWidget(`You will be tutoring ${l.friendlyFullName} during mod ${shared_1.stringifyMod(m.mod)}.`).dom);
    });
  });
}

function finalizeMatching(matchingId, onVerify) {
  return __awaiter(this, void 0, void 0, function* () {
    if (yield isOperationConfirmedByUser({
      thisOpDoes: ['Marks the matching as finalized, which posts it on the schedule page and attendance tracker'],
      makeSureThat: ['Everyone is notified of the matching']
    })) {
      onVerify(); // MARK MATCHING AS FINALIZED

      const r = shared_1.matchings.state.getRecordOrFail(matchingId);
      r.status = 'finalized';
      shared_1.matchings.state.updateRecord(r);
    }
  });
}
/*

ROOT WIDGET

*/


function rootWidget() {
  function PillsWidget() {
    const dom = $(pillsString);
    dom.find('a').css('cursor', 'pointer').click(ev => {
      const text = $(ev.target).text();
      if (text == 'Tutors') shared_1.tutors.makeTiledViewAllWindow();
      if (text == 'Learners') shared_1.learners.makeTiledViewAllWindow();
      if (text == 'Bookings') shared_1.bookings.makeTiledViewAllWindow();
      if (text == 'Matchings') shared_1.matchings.makeTiledViewAllWindow();
      if (text == 'Request submissions') shared_1.requestSubmissions.makeTiledViewAllWindow();
      if (text == 'Requests') shared_1.requests.makeTiledViewAllWindow();
      ev.preventDefault();
      if (text == 'About') ui_1.showModal('About', 'Made by Suhao Jeffrey Huang', bb => [bb('OK', 'primary')]);

      if (text == 'Force refresh') {
        shared_1.tutors.state.forceRefresh();
        shared_1.learners.state.forceRefresh();
        shared_1.bookings.state.forceRefresh();
        shared_1.matchings.state.forceRefresh();
        shared_1.requests.state.forceRefresh();
        shared_1.requestSubmissions.state.forceRefresh();

        for (const window of shared_1.state.tiledWindows.val) {
          window.onLoad.trigger();
        }
      }

      if (text == 'Check request submissions') {
        checkRequestSubmissionsStep();
      }

      if (text == 'Handle requests and bookings') {
        handleRequestsAndBookingsStep();
      }

      if (text == 'Finalize matchings') {
        finalizeMatchingsStep();
      }
    });
    return {
      dom
    };
  }

  const dom = shared_1.container('<div id="app" class="layout-v"></div>')(shared_1.container('<nav class="navbar layout-item-fit">')($('<strong class="mr-4">ARC</strong>'), PillsWidget().dom), shared_1.container('<nav class="navbar layout-item-fit layout-v"></div>')(WindowsBar_1.WindowsBarWidget().dom), shared_1.container('<div class="layout-item-scroll"></div>')(TilingWindowManager_1.TilingWindowManagerWidget().dom));
  return {
    dom
  };
}

exports.rootWidget = rootWidget;
},{"./shared":"m0/6","../widgets/ui":"T2q6","../widgets/TilingWindowManager":"5dK+","../widgets/WindowsBar":"fk88","../widgets/Window":"8cu6","../widgets/Table":"Jwlf","../widgets/ActionBar":"DVx/","./server":"ZgGC"}],"7QCb":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("./core/shared");

const widget_1 = require("./core/widget");

console.log('hi there!');

window['appOnReady'] = () => __awaiter(this, void 0, void 0, function* () {
  // TODO: replace with proper loading widget
  $('body').append($('<h1 id="app">Loading...</h1>'));
  yield shared_1.initializeResources();
  $('body').empty();
  $('body').append(widget_1.rootWidget().dom);
});

$(document).ready(window['appOnReady']);
},{"./core/shared":"m0/6","./core/widget":"o4ND"}]},{},["7QCb"], null)


/* Automatically built on 2019-07-17 18:17:40 */

