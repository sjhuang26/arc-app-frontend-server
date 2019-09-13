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
    setTimeout(() => rej(JSON.stringify({
      error: true,
      message: "Server is not responding",
      val: null
    })), 5000);
    p.then(res);
  });
}

function convertServerStringToAskFinished(str) {
  try {
    if (typeof str !== "string") {
      throw new Error("server response not in correct type");
    } else {
      try {
        const response = JSON.parse(str);

        if (typeof response !== "object" || typeof response.error !== "boolean") {
          throw new Error("server response not in correct type");
        } else if (response.error) {
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
      } catch (err) {
        throw new Error("parsing issue >> " + shared_1.stringifyError(err));
      }
    }
  } catch (err) {
    const v = {
      status: AskStatus.ERROR,
      message: "during convert >> " + shared_1.stringifyError(err)
    };
    return v;
  }
}

exports.convertServerStringToAskFinished = convertServerStringToAskFinished;

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
    let result = JSON.stringify({
      error: true,
      val: null,
      message: "Mysterious error"
    });

    try {
      if (window["APP_DEBUG_MOCK"] !== 1) {
        console.log("[server]    args", args);

        if (args[0] === "command") {
          result = yield realServer(args);
        } else {
          result = yield failAfterFiveSeconds(realServer(args));
        }

        console.log("[server]  result", args, "=>", result);
      } else {
        console.log("[MOCK server]   args", args);
        result = yield failAfterFiveSeconds(mockServer(args));
        console.log("[MOCK server] result", args, "=>", result);
      }
    } catch (err) {
      result = JSON.stringify({
        status: AskStatus.ERROR,
        message: "askserver error >> " + shared_1.stringifyError(err)
      });
    }

    return convertServerStringToAskFinished(result);
  });
}

exports.askServer = askServer;
/*
KEY CONCEPT: how data is kept in sync (BUT THIS IS 100% TODO)
Suppose multiple people are using the app at once. When someone sends a change to the server, onClientNotification methods for ALL OTHER clients are called, which basically tell the other clients to "make XYZ change to your local copy of the data".
*/

function onClientNotification(args) {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("[server notification]", args);
    const getResource = {
      tutors: () => shared_1.tutors,
      learners: () => shared_1.learners,
      bookings: () => shared_1.bookings,
      matchings: () => shared_1.matchings,
      requests: () => shared_1.requests,
      requestSubmissions: () => shared_1.requestSubmissions
    };

    if (args[0] === "update") {
      getResource[args[1]]().state.onServerNotificationUpdate(args[2]);
    }

    if (args[0] === "delete") {
      getResource[args[1]]().state.onServerNotificationDelete(args[2]);
    }

    if (args[0] === "create") {
      getResource[args[1]]().state.onServerNotificationCreate(args[2]);
    }
  });
}

exports.onClientNotification = onClientNotification; // An ASK is a request sent to the server. Either the ASK is loading, or it is loaded successfully, or there is an error.

var AskStatus;

(function (AskStatus) {
  AskStatus["LOADING"] = "LOADING";
  AskStatus["LOADED"] = "LOADED";
  AskStatus["ERROR"] = "ERROR";
})(AskStatus = exports.AskStatus || (exports.AskStatus = {})); // The point of the mock server is for demos, where we don't want to link to the real spreadsheet with the real data.


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
    if (args[0] === "retrieveAll") {
      return this.success(this.contents);
    }

    if (args[0] === "update") {
      this.contents[String(args[1].id)] = args[1];
      onClientNotification(["update", this.resource().name, args[1]]);
      return this.success(null);
    }

    if (args[0] === "create") {
      if (args[1].date === -1) {
        args[1].date = Date.now();
      }

      if (args[1].id === -1) {
        args[1].id = this.nextKey;
        ++this.nextKey;
      }

      this.contents[String(args[1].id)] = args[1];
      onClientNotification(["create", this.resource().name, args[1]]);
      return this.success(this.contents[String(args[1].id)]);
    }

    if (args[0] === "delete") {
      delete this.contents[String(args[1])];
      onClientNotification(["delete", this.resource().name, args[1]]);
      return this.success(null);
    }

    throw new Error("args not matched");
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
        }, 100); // fake a small delay
      });
    });
  }

} // You can edit this to add fake demo data, if you want.


exports.mockResourceServerEndpoints = {
  tutors: new MockResourceServerEndpoint(() => shared_1.tutors, {
    "1561605140223": {
      id: 1561605140223,
      date: 1561267154650,
      friendlyFullName: "Jordan McCann",
      friendlyName: "Jordan",
      firstName: "Jordan",
      lastName: "McCann",
      grade: 10,
      studentId: 99999,
      email: "foobar@icloud.com",
      phone: "5181234567",
      contactPref: "phone",
      homeroom: "H123",
      homeroomTeacher: "HRTeacher",
      mods: [1, 2, 3, 6, 11, 12, 16],
      modsPref: [3],
      subjectList: "English",
      attendance: {},
      dropInMods: [3]
    }
  }),
  learners: new MockResourceServerEndpoint(() => shared_1.learners, {
    "1567531044346": {
      id: 1567531044346,
      date: 1567531044346,
      friendlyFullName: "Jeffrey Huang",
      friendlyName: "Jeffrey",
      firstName: "Jeffrey",
      lastName: "Huang",
      grade: 0,
      studentId: 8355,
      email: "asdfasdf@gmail.com",
      phone: "555-555-5555",
      homeroom: "H123",
      homeroomTeacher: "HRTeacher",
      contactPref: "either",
      attendance: {}
    }
  }),
  bookings: new MockResourceServerEndpoint(() => shared_1.bookings, {}),
  matchings: new MockResourceServerEndpoint(() => shared_1.matchings, {}),
  requests: new MockResourceServerEndpoint(() => shared_1.requests, {}),
  requestSubmissions: new MockResourceServerEndpoint(() => shared_1.requestSubmissions, {
    "1567530880861": {
      id: 1567530880861,
      date: 1562007565571,
      friendlyFullName: "Jeffrey Huang",
      friendlyName: "Jeffrey",
      firstName: "Jeffrey",
      lastName: "Huang",
      grade: 0,
      studentId: 8355,
      email: "asdfasdf@gmail.com",
      phone: "555-555-5555",
      contactPref: "either",
      homeroom: "H123",
      homeroomTeacher: "HRTeacher",
      mods: [3],
      subject: "English",
      specialRoom: "",
      status: "unchecked"
    },
    "1567530880981": {
      id: 1567530880981,
      date: 1562100813234,
      friendlyFullName: "Mary Jane",
      friendlyName: "Mary",
      firstName: "Mary",
      lastName: "Jane",
      grade: 0,
      studentId: 16234,
      email: "s",
      phone: "s",
      contactPref: "email",
      homeroom: "H123",
      homeroomTeacher: "HRTeacher",
      mods: [3],
      subject: "Math",
      specialRoom: "",
      status: "unchecked"
    },
    "1567530882754": {
      id: 1567530882754,
      date: 1562028050971,
      friendlyFullName: "John Doe",
      friendlyName: "John",
      firstName: "John",
      lastName: "Doe",
      grade: 0,
      studentId: 12345,
      email: "undefined",
      phone: "undefined",
      contactPref: "either",
      homeroom: "H123",
      homeroomTeacher: "HRTeacher",
      mods: [3],
      subject: "all subjects",
      specialRoom: "B812",
      status: "unchecked"
    }
  })
};

function realServer(args) {
  return __awaiter(this, void 0, void 0, function* () {
    function getGoogleAppsScriptEndpoint() {
      if (window["google"] === undefined || window["google"].script === undefined) {
        // This will be displayed to the user
        throw "You should turn on testing mode. Click OTHER >> TESTING MODE.";
      }

      return window["google"].script.run;
    }

    let result = "Mysterious error";

    try {
      result = yield new Promise((res, rej) => {
        getGoogleAppsScriptEndpoint().withFailureHandler(rej).withSuccessHandler(res).onClientAsk(args);
      }); // NOTE: an "error: true" response is still received by the client through withSuccessHandler().
    } catch (err) {
      result = JSON.stringify({
        error: true,
        val: null,
        message: shared_1.stringifyError(err)
      });
    }

    if (typeof result !== "string") {
      result = JSON.stringify({
        error: true,
        val: null,
        message: shared_1.stringifyError("not a string: " + String(result))
      });
    }

    return result;
  });
}

function mockServer(args) {
  return __awaiter(this, void 0, void 0, function* () {
    let result = "Mysterious error"; // only for resources so far

    try {
      const mockArgs = JSON.parse(JSON.stringify(args));

      if (args[0] === "command") {
        if (args[1] === "syncDataFromForms") {
          throw new Error("command syncDataFromForms is not supported on the testing server");
        }

        if (args[1] === "recalculateAttendance") {
          throw new Error("command recalculateAttendance is not supported on the testing server");
        }

        if (args[1] === "generateSchedule") {
          throw new Error("command generateSchedule is not supported on the testing server");
        }

        throw new Error("command [unknown] is not supported on the testing server");
      }

      result = JSON.stringify((yield exports.mockResourceServerEndpoints[mockArgs[0]].replyToClientAsk(mockArgs.slice(1))));
    } catch (err) {
      result = JSON.stringify({
        error: true,
        val: null,
        message: shared_1.stringifyError(err)
      });
    }

    if (typeof result !== "string") {
      result = JSON.stringify({
        error: true,
        val: null,
        message: shared_1.stringifyError("not a string: " + String(result))
      });
    }

    return result;
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
  const dom = shared_1.container("<form></form>")(fields.map(({
    title,
    type,
    name,
    info
  }) => {
    const widget = type();
    widgets[name] = widget;
    return shared_1.container('<div class="form-group row"></div>')(shared_1.container('<label class="col-5 col-form-label"></label>')(shared_1.container("<b></b>")(title), info && shared_1.container('<i class="ml-2"></i>')(info)), shared_1.container('<div class="col-7"></div>')(widget.dom));
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
          throw new Error("name " + String(name) + " does not exist in form");
        }

        widgets[name].setValue(value);
      }
    }

  };
}

exports.FormWidget = FormWidget;
},{"../core/shared":"m0/6"}],"T2q6":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");
/*

THIS IS LITERALLY JUST A BIG UTILITIES FILE FOR WIDGETS.

*/

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


function ListGroupNavigationWidget(data, dataToContent, emptyUiMessage, onRenavigation) {
  function renavigate(item, index) {
    dom.children().removeClass("active");
    dom.children().eq(index).addClass("active");
    onRenavigation(item, index);
  }

  const dom = shared_1.container('<ul class="list-group">')(data.length === 0 ? shared_1.container('<li class="list-group-item">')("No items") : data.map((item, index) => shared_1.container('<li class="list-group-item">')(dataToContent(item)).click(() => renavigate(item, index))));
  return shared_1.DomWidget(dom);
}

exports.ListGroupNavigationWidget = ListGroupNavigationWidget;

function addPopoverToDom(dom, popoverDom) {
  dom.popover({
    content: shared_1.container("<span>")(...popoverDom.toArray())[0]
  });
}

exports.addPopoverToDom = addPopoverToDom;

function ErrorWidget(message) {
  const dom = shared_1.container('<div class="alert alert-danger"></div>')(shared_1.container("<h1></h1>")("Error"), $("<p><strong>An error occurred. You can try closing the window and opening again.</strong></p>"), shared_1.container("<span></span>")(message));
  return shared_1.DomWidget(dom);
}

exports.ErrorWidget = ErrorWidget;

function ButtonWidget(content, onClick, variant = "primary") {
  // to create an outline button, add "outline" to the variant
  if (variant === "outline") variant = "outline-primary";

  if (typeof content === "string") {
    return shared_1.DomWidget($("<button></button>").text(content).addClass("btn btn-" + variant).click(onClick));
  } else {
    return shared_1.DomWidget($("<button></button>").append(content).addClass("btn btn-" + variant).click(onClick));
  }
}

exports.ButtonWidget = ButtonWidget;
const modalHtmlString = `<div class="modal" tabindex="-1" role="dialog">
<div class="modal-dialog modal-lg" role="document">
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

function showModal(title, content, buildButtons, preventBackgroundClose) {
  const dom = $(modalHtmlString);
  dom.find(".modal-title").text(title);
  dom.find(".modal-body").append(typeof content === "string" ? shared_1.container("<p></p>")(content) : content); // https://stackoverflow.com/questions/10466129/how-to-hide-bootstrap-modal-with-javascript

  const closeModal = () => dom.modal("hide");

  const buildButtonsParameterFunction = (text, style, onClick, preventAutoClose) => $('<button type="button" class="btn">').addClass("btn-" + style).click(() => {
    if (onClick) {
      onClick();
    }

    if (!preventAutoClose) {
      closeModal();
    }
  }).text(text);

  buildButtonsParameterFunction.close = closeModal;
  dom.find(".modal-footer").append(buildButtons(buildButtonsParameterFunction));
  const settings = {}; // https://stackoverflow.com/questions/22207377/disable-click-outside-of-bootstrap-modal-area-to-close-modal

  if (preventBackgroundClose) {
    settings.backdrop = "static";
    settings.keyboard = false;
  }

  dom.modal(settings);
  const modifiedPromise = new Promise(res => {
    dom.on("hidden.bs.modal", () => res());
  });
  modifiedPromise.closeModal = closeModal;
  return modifiedPromise;
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
      dom.change(() => doThis.call(null, dom.val()));
    }

  };
}

exports.FormStringInputWidget = FormStringInputWidget;

function FormTextareaWidget() {
  const dom = $(`<textarea class="form-control">`);
  return {
    dom,

    getValue() {
      return String(dom.val());
    },

    setValue(newVal) {
      return dom.val(newVal);
    },

    onChange(doThis) {
      dom.change(() => {
        doThis.call(null, dom.val());
      });
    }

  };
}

exports.FormTextareaWidget = FormTextareaWidget;

function FormJsonInputWidget(defaultValue) {
  const dom = $(`<input class="form-control" type="text">`);
  dom.val(JSON.stringify(defaultValue));
  return {
    dom,

    getValue() {
      return JSON.parse(dom.val());
    },

    setValue(newVal) {
      return dom.val(JSON.stringify(newVal));
    },

    onChange(doThis) {
      dom.change(() => doThis.call(null, JSON.parse(dom.val())));
    }

  };
}

exports.FormJsonInputWidget = FormJsonInputWidget;

function FormNumberInputWidget(type) {
  let dom = null;

  if (type === "number") {
    dom = $(`<input class="form-control" type="number">`);
  }

  if (type === "datetime-local") {
    dom = $(`<input class="form-control" type="datetime-local">`);
  }

  if (type === "id") {
    // TODO: create a resource selection dropdown, or at least a name search
    dom = $(`<input class="form-control" type="number">`);
  }

  function getVal() {
    if (type == "datetime-local") {
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
      if (type == "datetime-local") {
        // a hack to get around Typescript types
        const htmlEl = dom.get(0);
        htmlEl.valueAsNumber = val;
        return dom;
      }

      return dom.val(val);
    },

    onChange(doThis) {
      dom.change(doThis.call(null, getVal()));
    }

  };
}

exports.FormNumberInputWidget = FormNumberInputWidget;

function FormNumberArrayInputWidget(type) {
  let dom = null;

  if (type === "number") {
    // arrays are entered as comma-separated values
    dom = $(`<input class="form-control" type="text">`);
  } else {
    throw new Error("unsupported type");
  }

  function getVal() {
    return String(dom.val()).split(",").map(x => x.trim()).filter(x => x !== "").map(x => Number(x));
  }

  return {
    dom,

    getValue() {
      return getVal();
    },

    setValue(val) {
      return dom.val(val.map(x => String(x)).join(", "));
    },

    onChange(doThis) {
      dom.change(doThis.call(null, getVal()));
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

function IdField() {
  return () => FormNumberInputWidget("number");
}

exports.IdField = IdField;

function SelectField(options, optionTitles) {
  return () => FormSelectWidget(options, optionTitles);
}

exports.SelectField = SelectField;

function NumberArrayField(type) {
  return () => FormNumberArrayInputWidget(type);
}

exports.NumberArrayField = NumberArrayField;

function JsonField(defaultValue) {
  return () => FormJsonInputWidget(defaultValue);
}

exports.JsonField = JsonField;

function FormSubmitWidget(text) {
  return shared_1.DomWidget($('<button class="btn btn-outline-success type="submit"></button>').text(text));
}

exports.FormSubmitWidget = FormSubmitWidget;

function FormSelectWidget(options, optionTitles) {
  const dom = shared_1.container('<select class="form-control"></select>')(options.map((_o, i) => shared_1.container("<option></option>")(optionTitles[i]).val(options[i])));
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

function FormToggleWidget(titleWhenFalse, titleWhenTrue, styleWhenFalse = "outline-secondary", styleWhenTrue = "primary") {
  function setVal(newVal) {
    if (val === newVal) return;

    if (newVal) {
      val = true;
      dom.text(titleWhenTrue);
      dom.removeClass("btn-" + styleWhenFalse);
      dom.addClass("btn-" + styleWhenTrue);
      return dom;
    } else {
      val = false;
      dom.text(titleWhenFalse);
      dom.removeClass("btn-" + styleWhenTrue);
      dom.addClass("btn-" + styleWhenFalse);
      return dom;
    }
  }

  const dom = $('<button class="btn"></button>').click(() => {
    if (val === null) {
      throw new Error("improper init of toggle button");
    }

    setVal(!val);
  });
  let val = null;
  const k = {
    dom,

    getValue() {
      if (val === null) throw new Error("attempt to read toggle button value before init");
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
  return shared_1.DomWidget($('<form class="form-inline"></form>').append(FormStringInputWidget("search").dom).append(FormSubmitWidget("Search").dom).submit(ev => {
    ev.preventDefault();
    onSubmit.call(null);
  }));
}

exports.SearchItemWidget = SearchItemWidget;

function createMarkerLink(text, onClick) {
  return $('<a style="cursor: pointer; text-decoration: underline"></a>').text(text).click(onClick);
}

exports.createMarkerLink = createMarkerLink;

function MessageTemplateWidget(content) {
  const textarea = $('<textarea class="form-control"></textarea>');
  textarea.val(content);
  const button = ButtonWidget("Copy to clipboard", () => {
    const htmlEl = textarea[0];
    htmlEl.select();
    document.execCommand("copy");
    button.val("Copied!");
    setTimeout(() => button.val("Copy to clipboard"), 1000);
  });
  return shared_1.DomWidget(shared_1.container('<div class="card"></div>')(shared_1.container('<div class="card-body"></div>')(textarea, button)));
}

exports.MessageTemplateWidget = MessageTemplateWidget;
},{"../core/shared":"m0/6"}],"Jwlf":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const shared_1 = require("../core/shared");

function TableWidget(headerTitles, makeRowContent) {
  let values = [];
  const dom = $('<table class="table"></table>');

  function setAllValues(collection) {
    if (typeof collection === "object") {
      values = Object.values(collection);
    } else {
      values = collection;
    }

    rebuildTable();
  }

  function rebuildTable() {
    dom.empty(); // headers

    dom.append(shared_1.container("<thead></thead>")(shared_1.container("<tr></tr>")(headerTitles.map(str => shared_1.container('<th scope="col"></th>')(str))))); // content

    dom.append(shared_1.container("<tbody></tbody>")(values.map(record => shared_1.container("<tr></tr>")(makeRowContent(record).map((rowContent, i) => shared_1.container("<td></td>")(typeof rowContent === "string" ? document.createTextNode(rowContent) : rowContent))))));
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

const ui_1 = require("../widgets/ui");

const Table_1 = require("../widgets/Table");

function MyTesting() {
  return 4;
}

exports.MyTesting = MyTesting;
/*

ALL BASIC CLASSES AND BASIC UTILS

*/

function arrayEqual(a, b) {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

exports.arrayEqual = arrayEqual;

function alertError(err) {
  return __awaiter(this, void 0, void 0, function* () {
    yield ui_1.showModal("Error!", container("<div>")($("<p><b>There was an error.</b></p>"), container("<p>")(stringifyError(err))), bb => [bb("OK", "primary")]);
  });
}

exports.alertError = alertError; // This function converts mod numbers (ie. 11) into A-B-day strings (ie. 1B).
// The function is not used often because we expect users of the app to be able to
// work with the 1-20 mod notation.

function stringifyMod(mod) {
  if (1 <= mod && mod <= 10) {
    return String(mod) + "A";
  } else if (11 <= mod && mod <= 20) {
    return String(mod - 10) + "B";
  }

  throw new Error(`mod ${mod} isn't serializable`);
}

exports.stringifyMod = stringifyMod;

function stringifyError(error) {
  console.error(error);

  if (error instanceof Error) {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  }

  try {
    return JSON.stringify(error);
  } catch (unusedError) {
    return String(error);
  }
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
      return $(newTag).append(children[0].map(x => typeof x === "string" ? $(document.createTextNode(x)) : x));
    }

    return $(newTag).append(children.map(x => typeof x === "string" ? $(document.createTextNode(x)) : x));
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
  return mods.map(mod => String(mod) + (modsPref.includes(mod) ? "*" : "")).join(", ");
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
    return this.askEndpoint("retrieveAll");
  }

  create(record) {
    return this.askEndpoint("create", record);
  }

  delete(id) {
    return this.askEndpoint("delete", id);
  }

  debug() {
    return this.askEndpoint("debug");
  }

  update(record) {
    return this.askEndpoint("update", record);
  }

}

exports.ResourceEndpoint = ResourceEndpoint;

class ResourceObservable extends ObservableState {
  constructor(endpoint) {
    super({
      status: server_1.AskStatus.ERROR,
      message: "resource was not initialized properly"
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
      throw new Error("record not available: " + this.endpoint.name + "/#" + id);
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
      throw new Error("resource is not loaded: " + this.endpoint.name);
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
      if (this.val.status === server_1.AskStatus.ERROR) return this.val;
      this.val.val[String(record.id)] = record;
      this.change.trigger();
      return yield this.endpoint.update(record);
    });
  }

  createRecord(record) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.val.status === server_1.AskStatus.ERROR) return this.val;
      const ask = yield this.endpoint.create(record);

      if (ask.status !== server_1.AskStatus.ERROR) {
        this.val.val[String(ask.val.id)] = ask.val;
        this.change.trigger();
      }

      return ask;
    });
  }

  deleteRecord(id) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.val.status === server_1.AskStatus.ERROR) return this.val;
      delete this.val.val[String(id)];
      this.change.trigger();
      return yield this.endpoint.delete(id);
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

  createFriendlyMarker(id, builder, onClick) {
    // TODO
    return this.createDataEditorMarker(id, builder, onClick);
  }

  createDataEditorMarker(id, builder, onClick = () => this.makeTiledEditWindow(id)) {
    return ui_1.createMarkerLink(this.createLabel(id, builder), onClick);
  }

  createLabel(id, builder) {
    try {
      const record = this.state.getRecordOrFail(id);
      return builder.call(null, record);
    } catch (e) {
      console.error(e);
      return `(??? UNKNOWN #${String(id)} ???)`;
    }
  }

  createDomLabel(id, builder) {
    try {
      const record = this.state.getRecordOrFail(id);
      return builder.call(null, record);
    } catch (e) {
      console.error(e);
      return $(`<span>(??? UNKNOWN #${String(id)} ???)</span>`);
    }
  } // The edit window is kind of combined with the view window.


  makeTiledEditWindow(id) {
    return __awaiter(this, void 0, void 0, function* () {
      let record = null;
      let errorMessage = "";

      try {
        function capitalizeWord(w) {
          return w.charAt(0).toUpperCase() + w.slice(1);
        }

        yield this.state.getRecordCollectionOrFail();
        record = this.state.getRecordOrFail(id);
        const windowLabel = capitalizeWord(this.info.title) + ": " + this.createLabel(id, this.info.makeLabel);
        const form = this.makeFormWidget();
        form.setAllValues(record);
        ui_1.showModal(windowLabel, container("<div></div>")(container("<h1></h1>")(windowLabel), form.dom), bb => [bb("Delete", "danger", () => this.makeTiledDeleteWindow(id, () => bb.close()), false), bb("Save", "primary", () => __awaiter(this, void 0, void 0, function* () {
          const ask = yield this.state.updateRecord(form.getAllValues());

          if (ask.status === server_1.AskStatus.ERROR) {
            alertError(ask.message);
          }
        })), bb("Close", "secondary")]);
      } catch (err) {
        const windowLabel = "ERROR in: " + this.info.title + " #" + id;
        errorMessage = stringifyError(err);
        ui_1.showModal(windowLabel, ui_1.ErrorWidget(errorMessage).dom, bb => [bb("Close", "primary")]);
      }
    });
  }

  makeTiledCreateWindow() {
    return __awaiter(this, void 0, void 0, function* () {
      let errorMessage = "";

      try {
        yield this.state.getRecordCollectionOrFail();
        const windowLabel = "Create new " + this.info.title;
        const form = this.makeFormWidget();
        form.setAllValues({
          id: -1,
          date: Date.now()
        });
        ui_1.showModal(windowLabel, container("<div></div>")(container("<h1></h1>")(windowLabel), form.dom), bb => [bb("Create", "primary", () => __awaiter(this, void 0, void 0, function* () {
          try {
            server_1.getResultOrFail((yield this.state.createRecord(form.getAllValues())));
          } catch (err) {
            alertError(err);
          }
        })), bb("Cancel", "secondary")]);
      } catch (err) {
        const windowLabel = "ERROR in: create new " + this.info.title;
        errorMessage = stringifyError(err);
        ui_1.showModal(windowLabel, ui_1.ErrorWidget(errorMessage).dom, bb => [bb("Close", "primary")]);
      }
    });
  }

  makeTiledViewAllWindow() {
    return __awaiter(this, void 0, void 0, function* () {
      let recordCollection = null;
      let errorMessage = "";

      try {
        recordCollection = yield this.state.getRecordCollectionOrFail();
        const table = Table_1.TableWidget(this.info.tableFieldTitles.concat("View & edit"), record => this.info.makeTableRowContent(record).concat(ui_1.ButtonWidget("View & edit", () => {
          this.makeTiledEditWindow(record.id);
        }).dom));
        table.setAllValues(recordCollection);
        const windowLabel = "View all " + this.info.pluralTitle;
        ui_1.showModal(windowLabel, container("<div></div>")(container("<h1></h1>")(windowLabel), table.dom), bb => [bb("Create", "secondary", () => this.makeTiledCreateWindow(), true), bb("Close", "primary")]);
      } catch (err) {
        errorMessage = stringifyError(err);
        const windowLabel = "ERROR in: view all " + this.info.pluralTitle;
        ui_1.showModal(windowLabel, ui_1.ErrorWidget(errorMessage).dom, bb => [bb("Close", "primary")]);
      }
    });
  }

  makeTiledDeleteWindow(id, closeParentWindow) {
    const windowLabel = "Delete this " + this.info.title + "? (" + this.createLabel(id, record => record.friendlyFullName) + ")";
    ui_1.showModal(windowLabel, container("<div></div>")(container("<h1></h1>")("Delete?"), container("<p></p>")("Are you sure you want to delete this?")), bb => [bb("Delete", "danger", () => this.state.deleteRecord(id).then(() => closeParentWindow()).catch(err => alertError(err))), bb("Cancel", "primary")]);
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
  conf.fields.push(["id", ui_1.NumberField("number")], ["date", ui_1.NumberField("datetime-local")]);
  let fields = [];

  for (const [name, type] of conf.fields) {
    const x = conf.fieldNameMap[name];
    fields.push(Object.assign({
      title: typeof x === "string" ? x : x[0]
    }, Array.isArray(x) && {
      info: x[1]
    }, {
      name,
      type
    }));
  }

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
  return [["firstName", ui_1.StringField("text")], ["lastName", ui_1.StringField("text")], ["friendlyName", ui_1.StringField("text")], ["friendlyFullName", ui_1.StringField("text")], ["grade", ui_1.NumberField("number")], ["studentId", ui_1.NumberField("number")], ["email", ui_1.StringField("email")], ["phone", ui_1.StringField("string")], ["contactPref", ui_1.SelectField(["email", "phone", "either"], ["Email", "Phone", "Either"])], ["homeroom", ui_1.StringField("text")], ["homeroomTeacher", ui_1.StringField("text")], ["attendanceAnnotation", ui_1.StringField("text")]];
}

exports.makeBasicStudentConfig = makeBasicStudentConfig; // This maps field names to the words that show up in the UI.

const fieldNameMap = {
  firstName: "First name",
  lastName: "Last name",
  friendlyName: "Friendly name",
  friendlyFullName: "Friendly full name",
  grade: ["Grade", "A number from 9-12"],
  learner: ["Learner", "This is an ID. You usually will not need to edit this by hand."],
  tutor: ["Tutor", "This is an ID. You usually will not need to edit this by hand."],
  attendance: ["Attendance data", "Do not edit this by hand."],
  status: "Status",
  mods: ["Mods", "A comma-separated list of numbers from 1-20, corresponding to 1A-10B"],
  dropInMods: ["Drop-in mods", "A comma-separated list of numbers from 1-20, corresponding to 1A-10B"],
  mod: ["Mod", "A number from 1-20, corresponding to 1A-10B"],
  modsPref: ["Preferred mods", "A comma-separated list of numbers from 1-20, corresponding to 1A-10B"],
  subjectList: "Subjects",
  request: ["Request", "This is an ID. You usually will not need to edit this by hand."],
  subject: "Subject(s)",
  studentId: "Student ID",
  email: "Email",
  phone: "Phone",
  contactPref: "Contact preference",
  specialRoom: ["Special tutoring room", `Leave blank if the student isn't in special tutoring`],
  id: ["ID", `Do not modify unless you really know what you're doing!`],
  date: ["Date", "Date of creation -- do not change"],
  homeroom: "Homeroom",
  homeroomTeacher: "Homeroom teacher",
  step: ["Step", "A number 1-4."],
  chosenBooking: ["Chosen booking", "The ID of the booking that was chosen"],
  afterSchoolAvailability: "After-school availability",
  attendanceAnnotation: "Attendance annotation",
  additionalHours: ["Additional hours", "Additional time added to the hours count"]
};
/*

DECLARE INFO FOR EACH RESOURCE

*/

const tutorsInfo = {
  fields: [...makeBasicStudentConfig(), ["mods", ui_1.NumberArrayField("number")], ["modsPref", ui_1.NumberArrayField("number")], ["subjectList", ui_1.StringField("text")], ["attendance", ui_1.JsonField({})], ["dropInMods", ui_1.NumberArrayField("number")], ["afterSchoolAvailability", ui_1.StringField("text")], ["additionalHours", ui_1.StringField("text")]],
  fieldNameMap,
  tableFieldTitles: ["Name", "Grade", "Mods", "Subjects"],
  makeTableRowContent: record => [exports.tutors.createDataEditorMarker(record.id, x => x.friendlyFullName), record.grade, generateStringOfMods(record.mods, record.modsPref), record.subjectList],
  title: "tutor",
  pluralTitle: "tutors",
  makeLabel: record => record.friendlyFullName
};
const learnersInfo = {
  fields: [...makeBasicStudentConfig(), ["attendance", ui_1.JsonField({})]],
  fieldNameMap,
  tableFieldTitles: ["Name", "Grade"],
  makeTableRowContent: record => [exports.learners.createDataEditorMarker(record.id, x => x.friendlyFullName), record.grade],
  title: "learner",
  pluralTitle: "learners",
  makeLabel: record => record.friendlyFullName
};
const requestsInfo = {
  fields: [["learner", ui_1.NumberField("id")], ["mods", ui_1.NumberArrayField("number")], ["subject", ui_1.StringField("text")], ["specialRoom", ui_1.StringField("text")], ["step", ui_1.NumberField("number")], ["chosenBooking", ui_1.NumberField("id")]],
  fieldNameMap,
  tableFieldTitles: ["Learner", "Subject", "Mods"],
  makeTableRowContent: record => [exports.learners.createDataEditorMarker(record.learner, x => x.friendlyFullName), record.subject, record.mods.join(", ")],
  title: "request",
  pluralTitle: "requests",
  makeLabel: record => exports.learners.createLabel(record.learner, x => x.friendlyFullName)
};
const bookingsInfo = {
  fields: [["request", ui_1.NumberField("id")], ["tutor", ui_1.NumberField("id")], ["mod", ui_1.NumberField("number")], ["status", ui_1.SelectField(["ignore", "unsent", "waitingForTutor", "rejected"], ["Ignore", "Unsent", "Waiting", "Rejected"])]],
  fieldNameMap,
  tableFieldTitles: ["Learner", "Tutor", "Mod", "Status"],
  makeTableRowContent: record => [exports.learners.createDataEditorMarker(exports.requests.state.getRecordOrFail(record.request).learner, x => x.friendlyFullName), exports.tutors.createDataEditorMarker(record.tutor, x => x.friendlyFullName), record.mod, record.status],
  title: "booking",
  pluralTitle: "bookings",
  makeLabel: record => exports.tutors.state.getRecordOrFail(record.tutor).friendlyFullName + " <> " + exports.learners.state.getRecordOrFail(exports.requests.state.getRecordOrFail(record.request).learner).friendlyFullName
};
const matchingsInfo = {
  fields: [["learner", ui_1.StringField("text")], ["tutor", ui_1.StringField("text")], ["subject", ui_1.StringField("text")], ["mod", ui_1.NumberField("number")], ["specialRoom", ui_1.StringField("text")]],
  fieldNameMap,
  tableFieldTitles: ["Learner", "Tutor", "Mod", "Subject", "Status"],
  makeTableRowContent: record => [exports.learners.createDataEditorMarker(record.learner, x => x.friendlyFullName), exports.tutors.createDataEditorMarker(record.tutor, x => x.friendlyFullName), record.mod, record.subject, record.status],
  title: "matching",
  pluralTitle: "matchings",
  makeLabel: record => exports.tutors.state.getRecordOrFail(record.tutor).friendlyFullName + " <> " + exports.learners.state.getRecordOrFail(record.learner).friendlyFullName
};
const requestSubmissionsInfo = {
  fields: [...makeBasicStudentConfig(), ["mods", ui_1.NumberArrayField("number")], ["subject", ui_1.StringField("text")], ["specialRoom", ui_1.StringField("text")], ["status", ui_1.SelectField(["unchecked", "checked"], ["Unchecked", "Checked"])]],
  fieldNameMap,
  tableFieldTitles: ["Name", "Mods", "Subject"],
  makeTableRowContent: record => [record.friendlyFullName, record.mods.join(", "), record.subject],
  title: "request submission",
  pluralTitle: "request submissions",
  makeLabel: record => record.friendlyFullName
};
/*

LET'S PULL IT ALL TOGETHER

*/

exports.tutors = new Resource("tutors", processResourceInfo(tutorsInfo));
exports.learners = new Resource("learners", processResourceInfo(learnersInfo));
exports.requests = new Resource("requests", processResourceInfo(requestsInfo));
exports.bookings = new Resource("bookings", processResourceInfo(bookingsInfo));
exports.matchings = new Resource("matchings", processResourceInfo(matchingsInfo));
exports.requestSubmissions = new Resource("requestSubmissions", processResourceInfo(requestSubmissionsInfo));

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
/*

VERY USEFUL FOR DEBUG

*/

window["appDebug"] = () => ({
  tutors: exports.tutors,
  learners: exports.learners,
  bookings: exports.bookings,
  matchings: exports.matchings,
  requests: exports.requests,
  requestSubmissions: exports.requestSubmissions
});
},{"./server":"ZgGC","../widgets/Form":"IhYu","../widgets/ui":"T2q6","../widgets/Table":"Jwlf"}],"o4ND":[function(require,module,exports) {
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

const Table_1 = require("../widgets/Table");

const server_1 = require("./server");
/*

BASIC UTILITIES

*/


function isOperationConfirmedByUser(args) {
  return __awaiter(this, void 0, void 0, function* () {
    return new Promise(res => __awaiter(this, void 0, void 0, function* () {
      yield ui_1.showModal("Are you sure?", "", bb => [bb("No", "outline-secondary"), bb("Yes", "primary", () => res(true))]);
      res(false);
    }));
  });
}

const navigationBarString = `
<ul class="nav nav-pills">
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-toggle="dropdown">Commands</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item">Sync data from forms</a>
            <a class="dropdown-item">Generate schedule</a>
            <a class="dropdown-item">Recalculate attendance</a>
        </div>
    </li>
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-toggle="dropdown">Advanced data editor</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item">Tutors</a>
            <a class="dropdown-item">Learners</a>
            <a class="dropdown-item">Requests</a>
            <a class="dropdown-item">Request submissions</a>
            <a class="dropdown-item">Bookings</a>
            <a class="dropdown-item">Matchings</a>
        </div>
    </li>
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-toggle="dropdown">Scheduling steps</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item">Handle requests</a>
            <a class="dropdown-item">Edit schedule</a>
            <a class="dropdown-item">View schedule</a>
        </div>
    </li>
    <li class="nav-item">
        <a class="nav-link">Attendance</a>
    </li>
    <li class="nav-item">
        <a class="nav-link">After-school availability</a>
    </li>
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-toggle="dropdown">Other</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item">About</a>
            <a class="dropdown-item">Force refresh</a>
            <a class="dropdown-item">Testing mode</a>
        </div>
    </li>
</ul>`;

function showTestingModeWarning() {
  ui_1.showModal("Testing mode loaded", "The app has been disconnected from the actual database/forms and replaced with a database with test data.", bb => [bb("OK", "primary")]);
}
/*

LOTS OF FUNCTIONS!!!!!

IF YOU WANT ANY HOPE OF UNDERSTANDING THIS CODE, READ THE BOTTOM FIRST.

*/


function showStep3Messager(bookingId) {
  const b = shared_1.bookings.state.getRecordOrFail(bookingId);
  const r = shared_1.requests.state.getRecordOrFail(b.request);
  const t = shared_1.tutors.state.getRecordOrFail(b.tutor);
  const l = shared_1.learners.state.getRecordOrFail(r.learner);
  const dom = $("<div></div>");
  dom.append($("<p>Contact the tutor:</p>"));
  dom.append(ui_1.MessageTemplateWidget(`This is to confirm that starting now, you will be tutoring ${l.friendlyFullName} in subject ${r.subject} during mod ${shared_1.stringifyMod(b.mod)}.`).dom);
  dom.append($("<p>Contact the learner:</p>"));
  dom.append(ui_1.MessageTemplateWidget(`This is to confirm that starting now, you will be tutored by ${t.friendlyFullName} in subject ${r.subject} during mod ${shared_1.stringifyMod(b.mod)}.`).dom);
  ui_1.showModal("Messager", shared_1.container("<div>")(shared_1.container("<h1>")("Messager for ", shared_1.learners.createDataEditorMarker(r.learner, x => x.friendlyFullName), " <> ", shared_1.tutors.createDataEditorMarker(b.tutor, x => x.friendlyFullName)), dom), bb => [bb("OK", "primary")]);
}

function showStep1Messager(bookingId) {
  const b = shared_1.bookings.state.getRecordOrFail(bookingId);
  const r = shared_1.requests.state.getRecordOrFail(b.request);
  const t = shared_1.tutors.state.getRecordOrFail(b.tutor);
  const l = shared_1.learners.state.getRecordOrFail(r.learner);
  const dom = $("<div></div>");

  if (b.status === "unsent") {
    dom.append($("<p>Contact the tutor:</p>"));
    dom.append(ui_1.MessageTemplateWidget(`Hi! Can you tutor a student in ${r.subject} on mod ${shared_1.stringifyMod(b.mod)}?`).dom);
  }

  if (b.status === "waitingForTutor") {
    dom.append($("<p>You are waiting for the tutor.</p>"));
  }

  ui_1.showModal("Messager", shared_1.container("<div>")(shared_1.container("<h1>")("Messager for ", shared_1.learners.createDataEditorMarker(r.learner, x => x.friendlyFullName), " <> ", shared_1.tutors.createDataEditorMarker(b.tutor, x => x.friendlyFullName)), dom), bb => [bb("OK", "primary")]);
}

function showAfterSchoolAvailablityModal() {
  try {
    const tutorRecords = shared_1.tutors.state.getRecordCollectionOrFail();
    const filtered = [];
    const table = Table_1.TableWidget(["Name", "Availability"], id => [shared_1.tutors.createDataEditorMarker(id, x => x.friendlyFullName), shared_1.tutors.createLabel(id, x => x.afterSchoolAvailability)]);

    for (const tutor of Object.values(tutorRecords)) {
      if (tutor.afterSchoolAvailability !== "") {
        filtered.push(tutor.id);
      }
    }

    table.setAllValues(filtered);
    ui_1.showModal("After-school availability", table.dom, bb => [bb("Close", "primary")]);
  } catch (e) {
    shared_1.alertError(e);
  }
}

function requestChangeToStep4(requestId, onFinish) {
  return __awaiter(this, void 0, void 0, function* () {
    const {
      closeModal
    } = ui_1.showModal("Saving...", "", bb => [], true);

    try {
      const r = shared_1.requests.state.getRecordOrFail(requestId);
      const b = shared_1.bookings.state.getRecordOrFail(r.chosenBooking); // ADD MATCHING

      yield shared_1.matchings.state.createRecord({
        learner: r.learner,
        tutor: b.tutor,
        subject: r.subject,
        mod: b.mod,
        specialRoom: r.specialRoom,
        id: -1,
        date: -1
      }); // DELETE ALL BOOKINGS ASSOCIATED WITH REQUEST

      for (const booking of Object.values(shared_1.bookings.state.getRecordCollectionOrFail())) {
        if (booking.request === r.id) {
          yield shared_1.bookings.state.deleteRecord(booking.id);
        }
      } // DELETE THE REFERENCE TO THE BOOKING & ADVANCE THE STEP


      r.step = 4;
      r.chosenBooking = -1;
      yield shared_1.requests.state.updateRecord(r);
    } catch (err) {
      shared_1.alertError(err);
    } finally {
      closeModal();
      onFinish();
    }
  });
}

function requestChangeToStep3(requestId, onFinish) {
  return __awaiter(this, void 0, void 0, function* () {
    const {
      closeModal
    } = ui_1.showModal("Saving...", "", bb => [], true);

    try {
      const r = shared_1.requests.state.getRecordOrFail(requestId);
      r.step = 3;
      yield shared_1.requests.state.updateRecord(r);
    } catch (err) {
      shared_1.alertError(err);
    } finally {
      closeModal();
      onFinish();
    }
  });
}

function requestChangeToStep2(requestId, bookingId, onFinish) {
  return __awaiter(this, void 0, void 0, function* () {
    if (yield isOperationConfirmedByUser("Are you sure you want to match these students?")) {
      const {
        closeModal
      } = ui_1.showModal("Saving...", "", bb => [], true);

      try {
        const r = shared_1.requests.state.getRecordOrFail(requestId); // "choose" the booking

        r.chosenBooking = bookingId; // go to step 2

        r.step = 2; // update record

        shared_1.requests.state.updateRecord(r);
      } catch (err) {
        shared_1.alertError(err);
      } finally {
        closeModal();
        onFinish();
      }

      return true;
    } else {
      return false;
    }
  });
}

function requestsNavigationScope(renavigate) {
  function stepToName(step) {
    if (step === 0) return "not started";
    if (step === 1) return "booking";
    if (step === 2) return "pass";
    if (step === 3) return "confirmation";
    return "???";
  } // MAJOR FUNCTIONS


  function generatePotentialTable({
    bookingsInfo,
    tutorIndex,
    request
  }) {
    const potentialTable = Table_1.TableWidget(["Tutor", "Book for mods..."], ({
      tutorId,
      mods
    }) => {
      const buttonsDom = $("<div></div>");

      for (const {
        mod,
        isPref,
        isAlreadyBooked,
        isAlreadyDropIn
      } of mods) {
        const modLabel = mod + (isPref ? "*" : "") + (isAlreadyDropIn ? " (drop-in)" : "");

        if (isAlreadyBooked) {
          buttonsDom.append(ui_1.ButtonWidget(modLabel + " (already booked)", () => {}).dom);
          continue;
        }

        const w = ui_1.FormToggleWidget(modLabel, "Unbook " + modLabel);
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

      return [shared_1.tutors.createDataEditorMarker(tutorId, x => x.friendlyFullName), buttonsDom];
    });
    const potentialTableValues = [];

    for (const tutor of Object.values(tutorIndex)) {
      const modResults = [];

      for (const mod of request.mods) {
        if (!tutor.matchedMods.includes(mod)) {
          const tutorRecord = shared_1.tutors.state.getRecordOrFail(tutor.id);

          if (tutorRecord.mods.includes(mod)) {
            modResults.push({
              mod,
              isPref: tutorRecord.modsPref.includes(mod),
              isAlreadyBooked: tutor.bookedMods.includes(mod),
              isAlreadyDropIn: tutorRecord.dropInMods.includes(mod)
            });
          }
        }
      }

      if (modResults.length > 0 && tutor.bookedMods.length === 0) {
        potentialTableValues.push({
          tutorId: tutor.id,
          mods: modResults
        });
      }
    }

    potentialTable.setAllValues(potentialTableValues);
    return potentialTable.dom;
  }

  function attemptRequestSubmissionConversion(record) {
    return __awaiter(this, void 0, void 0, function* () {
      // CREATE LEARNER
      // try to dig up a learner with matching student ID, which would mean
      // that the learner already exists in the database
      const matches = Object.values(learnerRecords).filter(x => x.studentId === record.studentId);
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
          contactPref: record.contactPref,
          homeroom: record.homeroom,
          homeroomTeacher: record.homeroomTeacher,
          attendanceAnnotation: "",
          attendance: {}
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
        specialRoom: record.specialRoom,
        step: 1
      }))); // MARK REQUEST SUBMISSION AS CHECKED
      // NOTE: this is only done if the above steps worked
      // so if there's an error, the request submission won't be obliterated

      record.status = "checked";
      server_1.getResultOrFail((yield shared_1.requestSubmissions.state.updateRecord(record)));
    });
  }

  function generateRequestsTable() {
    const requestsTable = Table_1.TableWidget(["Request", "Step #", "Open"], i => {
      return [shared_1.requests.createDataEditorMarker(i.id, x => shared_1.learners.createLabel(x.learner, y => y.friendlyFullName)), String(requestIndex[i.id].uiStep), ui_1.ButtonWidget("Open", () => {
        renavigate(["requests", i.id], false);
      }).dom];
    });
    requestsTable.setAllValues(Object.values(requestRecords));
    return requestsTable.dom;
  }

  function buildRequestIndex() {
    const index = {};

    for (const request of Object.values(requestRecords)) {
      index[request.id] = {
        id: request.id,
        hasBookings: false,
        uiStep: -1
      };
    }

    for (const booking of Object.values(bookingRecords)) {
      index[booking.request].hasBookings = true;
    }

    for (const i of Object.values(index)) {
      if (!index[i.id].hasBookings && requestRecords[i.id].step === 1) {
        index[i.id].uiStep = 0;
      } else {
        index[i.id].uiStep = requestRecords[i.id].step;
      }
    }

    return index;
  }

  function buildRSButton() {
    return ui_1.ButtonWidget("Convert new request submissions", () => __awaiter(this, void 0, void 0, function* () {
      const {
        closeModal
      } = ui_1.showModal("Converting...", "", bb => [], true);

      try {
        for (const record of uncheckedRequestSubmissions) {
          yield attemptRequestSubmissionConversion(record);
        }
      } catch (e) {
        shared_1.alertError(e);
      } finally {
        closeModal();
        ui_1.showModal("Conversion successful", "", bb => [bb("OK", "primary")]);
      }

      renavigate(["requests"], false);
    })).dom;
  }

  function buildTutorIndex() {
    const index = {};

    for (const x of Object.values(tutorRecords)) {
      index[String(x.id)] = {
        id: x.id,
        matchedMods: [],
        bookedMods: []
      };
    }

    for (const x of Object.values(matchingRecords)) {
      index[String(x.tutor)].matchedMods.push(x.mod);
    }

    for (const x of Object.values(bookingRecords)) {
      index[String(x.tutor)].bookedMods.push(x.mod);
    }

    return index;
  }

  function generateBookerTable(requestId) {
    const bookerTable = Table_1.TableWidget(["Booking", "Status", "Todo", "Match"], booking => {
      const formSelectWidget = ui_1.FormSelectWidget(["ignore", "unsent", "waitingForTutor", "rejected"], ["Ignore", "Unsent", "Waiting", "Rejected"]);
      formSelectWidget.setValue(booking.status);
      formSelectWidget.onChange(newVal => __awaiter(this, void 0, void 0, function* () {
        booking.status = newVal;
        const response = yield shared_1.bookings.state.updateRecord(booking);

        if (response.status === server_1.AskStatus.ERROR) {
          shared_1.alertError(response.message);
        }
      }));
      return [shared_1.bookings.createFriendlyMarker(booking.id, b => shared_1.tutors.createLabel(booking.tutor, x => x.friendlyFullName) + " <> " + shared_1.learners.createLabel(shared_1.requests.state.getRecordOrFail(booking.request).learner, x => x.friendlyFullName)), formSelectWidget.dom, ui_1.ButtonWidget("Todo", () => showStep1Messager(booking.id)).dom, ui_1.ButtonWidget("Match", () => {
        requestChangeToStep2(requestId, booking.id, () => renavigate(["requests"], false));
      }).dom];
    });
    bookerTable.setAllValues(Object.values(shared_1.bookings.state.getRecordCollectionOrFail()).filter(x => x.request === requestId).map(x => shared_1.bookings.state.getRecordOrFail(x.id)));
    return bookerTable.dom;
  }

  function generateEditBookingsButton({
    bookingsInfo,
    tutorIndex,
    request
  }) {
    return ui_1.ButtonWidget("Edit bookings", () => {
      ui_1.showModal("Edit bookings", generatePotentialTable({
        bookingsInfo,
        tutorIndex,
        request
      }), bb => [bb("Save", "primary", () => __awaiter(this, void 0, void 0, function* () {
        try {
          const {
            closeModal
          } = ui_1.showModal("Saving...", "", bb => []);

          for (const {
            tutorId,
            mod
          } of bookingsInfo) {
            yield shared_1.bookings.state.createRecord({
              id: -1,
              date: -1,
              tutor: tutorId,
              mod,
              request: request.id,
              status: "unsent"
            });
          }

          closeModal();
          renavigate(["requests", request.id], false);
        } catch (err) {
          shared_1.alertError(err);
        }
      })), bb("Cancel", "secondary")]);
    }).dom;
  } // LOAD RESOURCES


  const learnerRecords = shared_1.learners.state.getRecordCollectionOrFail();
  const bookingRecords = shared_1.bookings.state.getRecordCollectionOrFail();
  const matchingRecords = shared_1.matchings.state.getRecordCollectionOrFail();
  const requestRecords = shared_1.requests.state.getRecordCollectionOrFail();
  const tutorRecords = shared_1.tutors.state.getRecordCollectionOrFail();
  const requestSubmissionRecords = shared_1.requestSubmissions.state.getRecordCollectionOrFail(); // FILTER FOR UNCHECKED REQUEST SUBMISSIONS

  const uncheckedRequestSubmissions = Object.values(requestSubmissionRecords).filter(x => x.status === "unchecked"); // BUILD VARIABLES

  const requestIndex = buildRequestIndex();
  return {
    generateMainContentPanel(navigationState) {
      // RELEVANT TO ALL STEPS
      const requestId = navigationState[0];

      if (requestId === undefined) {
        return null;
      }

      const request = shared_1.requests.state.getRecordOrFail(requestId);
      const header = shared_1.container("<h1>")(shared_1.requests.createFriendlyMarker(requestId, () => "Request"), ": ", shared_1.learners.createFriendlyMarker(shared_1.requests.state.getRecordOrFail(requestId).learner, x => x.friendlyFullName), shared_1.container('<span class="badge badge-secondary">')(`Step ${requestIndex[requestId].uiStep} (${stepToName(requestIndex[requestId].uiStep)})`)); // LOGIC: We use a toggle structure where:
      // - There is a row of mod buttons
      // - There is add functionality, but not delete functionality (bookings can be individually deleted)
      // - Toggling the button toggles entries in a temporary array of all added bookings [[tutor, mod]] via. filters
      // - Clicking "Save bookings and close" will write to the database

      let bookingsInfo = []; // LOGIC: calculating which tutors work for this request
      // - tutor must not be matched at the target mod
      // - tutor may be matched to another mod
      // - for each tutor, keep track of which mods they've been matched to
      // - SENDS TO TABLE: [ tutorId, [ mod, isPref: boolean ] ]

      const tutorIndex = buildTutorIndex();

      if (requestIndex[requestId].uiStep < 2) {
        const uiStep01 = shared_1.container("<div></div>")(header, generateBookerTable(requestId), generateEditBookingsButton({
          bookingsInfo,
          tutorIndex,
          request
        }));
        return uiStep01;
      }

      if (requestIndex[requestId].uiStep === 2) {
        const uiStep2 = shared_1.container('<div class="jumbotron">')(shared_1.container("<h1>")("Write a pass for the learner"), shared_1.container('<p class="lead">')("Here is the information:"), shared_1.container("<p>")("Homeroom = " + shared_1.learners.createLabel(requestRecords[requestId].learner, x => x.homeroom)), shared_1.container("<p>")("Homeroom teacher = " + shared_1.learners.createLabel(requestRecords[requestId].learner, x => x.homeroomTeacher)), ui_1.ButtonWidget("OK, I've written the pass", () => requestChangeToStep3(requestId, () => renavigate(["requests", requestId], false))).dom);
        return uiStep2;
      }

      if (requestIndex[requestId].uiStep === 3) {
        const uiStep3 = shared_1.container('<div class="jumbotron">')(shared_1.container("<h1>")("Send a confirmation to the learner"), ui_1.ButtonWidget("Send confirmation", () => showStep3Messager(request.chosenBooking)).dom, shared_1.container('<p class="lead">')("After that, click the button below, and the tutor will be assigned for real."), ui_1.ButtonWidget("OK, let's assign the tutor for real", () => requestChangeToStep4(requestId, () => renavigate(["requests", requestId], false))).dom);
        return uiStep3;
      }

      if (requestIndex[requestId].uiStep === 4) {
        const uiStep4 = shared_1.container('<div class="jumbotron">')(shared_1.container("<h1>")("This request appears to be done"), shared_1.requests.createFriendlyMarker(requestId, () => "Open advanced request editor confirmation"));
        return uiStep4;
      }
    },

    sidebar: shared_1.container("<div>")(shared_1.container("<h1>")("Requests"), uncheckedRequestSubmissions.length > 0 ? buildRSButton() : undefined, generateRequestsTable())
  };
}

function scheduleEditNavigationScope(renavigate) {
  // LOAD RECORD COLLECTIONS
  const bookingRecords = shared_1.bookings.state.getRecordCollectionOrFail();
  const matchingRecords = shared_1.matchings.state.getRecordCollectionOrFail();
  const tutorRecords = shared_1.tutors.state.getRecordCollectionOrFail(); // CREATE AN INDEX OF OLD DROP-IN MODS

  const oldDropInModsIndex = {};

  for (const tutor of Object.values(tutorRecords)) {
    oldDropInModsIndex[tutor.id] = tutor.dropInMods;
  } // CREATE AN INDEX OF EDITED DROP-IN MODS (DEEP COPY)


  const editedDropInModsIndex = JSON.parse(JSON.stringify(oldDropInModsIndex)); // ON SAVE, COMPARE THE TWO INDEXES

  function onSave() {
    return __awaiter(this, void 0, void 0, function* () {
      const {
        closeModal
      } = ui_1.showModal("Saving...", "", bb => [], true);

      try {
        let wereChanges = false;

        for (const [idString, oldDropInMods] of Object.entries(oldDropInModsIndex)) {
          oldDropInMods.sort();
          const editedDropInMods = editedDropInModsIndex[idString];
          editedDropInMods.sort();

          if (!shared_1.arrayEqual(oldDropInMods, editedDropInMods)) {
            wereChanges = true; // this gets rid of duplicates as well

            tutorRecords[idString].dropInMods = [...new Set(editedDropInMods)];
            server_1.getResultOrFail((yield shared_1.tutors.state.updateRecord(tutorRecords[idString])));
          }
        }

        if (!wereChanges) {
          // no changes
          ui_1.showModal("No changes were detected in the schedule, so nothing was saved.", "", bb => [bb("OK", "primary")]);
        }
      } catch (e) {
        shared_1.alertError(e);
      } finally {
        closeModal();
      }
    });
  } // INIT DOM


  const availableDomA = shared_1.container("<div>")();
  const availableDomB = shared_1.container("<div>")();

  for (let i = 0; i < 10; ++i) {
    availableDomA.append(shared_1.container("<div>")($('<p class="lead"><strong></strong></p>').text(`Mod ${i + 1}`), shared_1.container('<ul class="list-group">')()));
  }

  for (let i = 0; i < 10; ++i) {
    availableDomB.append(shared_1.container("<div>")($('<p class="lead"><strong></strong></p>').text(`Mod ${i + 11}`), shared_1.container('<ul class="list-group">')()));
  }

  const scheduleDomA = shared_1.container("<div>")();
  const scheduleDomB = shared_1.container("<div>")();

  for (let i = 0; i < 10; ++i) {
    scheduleDomA.append(shared_1.container("<div>")($('<p class="lead"><strong></strong></p>').text(`Mod ${i + 1}`), shared_1.container('<ul class="list-group">')()));
  }

  for (let i = 0; i < 10; ++i) {
    scheduleDomB.append(shared_1.container("<div>")($('<p class="lead"><strong></strong></p>').text(`Mod ${i + 11}`), shared_1.container('<ul class="list-group">')()));
  } // CREATE INDEX OF TUTORS --> [ STATUS, STATUS, STATUS ... ] for each mod


  const tutorModStatusIndex = {};

  for (const tutor of Object.values(tutorRecords)) {
    tutorModStatusIndex[tutor.id] = {
      id: tutor.id,
      modStatus: []
    };

    for (let i = 0; i < 20; ++i) {
      tutorModStatusIndex[tutor.id].modStatus.push("none");
    } // mod status: available


    for (const mod of tutor.mods) {
      tutorModStatusIndex[tutor.id].modStatus[mod - 1] = "available";
    } // mod status: drop-in


    for (const mod of tutor.dropInMods) {
      if (tutorModStatusIndex[tutor.id].modStatus[mod - 1] === "available") {
        tutorModStatusIndex[tutor.id].modStatus[mod - 1] = "dropIn";
      }
    } // preferred mods


    for (const mod of tutor.modsPref) {
      tutorModStatusIndex[tutor.id].modStatus[mod - 1] += "Pref";
    }
  }

  for (const booking of Object.values(bookingRecords)) {
    if (booking.status !== "ignore" && booking.status !== "rejected") {
      tutorModStatusIndex[booking.tutor].modStatus[booking.mod - 1] = ["booked", booking.id];
    }
  }

  for (const matching of Object.values(matchingRecords)) {
    tutorModStatusIndex[matching.tutor].modStatus[matching.mod - 1] = ["matched", matching.id];
  }

  function popupUtilPlaceElement(domA, domB, {
    mod,
    element,
    popoverContent
  }) {
    if (mod > 10) {
      domB.children().eq(mod - 11).children().eq(1).append(element);
    } else {
      domA.children().eq(mod - 1).children().eq(1).append(element);
    }

    const popoverContentDom = $("<div>");
    element.popover({
      content: popoverContentDom[0],
      placement: "auto",
      html: true,
      trigger: "click"
    });
    element.on("show.bs.popover", () => {
      popoverContentDom.empty();
      popoverContentDom.append(popoverContent());
    });
  }

  function popupUtilCountUnavailable(id) {
    let x = 0;

    for (let i = 0; i < 20; ++i) {
      const status = tutorModStatusIndex[id].modStatus[i];

      if (status !== "none" && status !== "available" && status !== "availablePref") {
        ++x;
      }
    }

    return x;
  }

  function generatePopupAvailable(id, mod) {
    const initialStatus = tutorModStatusIndex[id].modStatus[mod - 1];

    if (typeof initialStatus !== "string") {
      throw new Error("typecheck failed in generatePopupSchedule");
    }

    const element = shared_1.container('<li class="list-group-item list-group-item-action">')(shared_1.tutors.createLabel(id, x => x.friendlyFullName), initialStatus.endsWith("Pref") ? "*" : "");

    if (initialStatus.endsWith("Pref")) {
      element.addClass("text-primary");
    }

    function popoverContent() {
      const popoverContent = shared_1.container('<div class="btn-group m-2">')();
      popoverContent.append(ui_1.ButtonWidget(`(${popupUtilCountUnavailable(id)}x)`, () => {}).dom);

      for (let i = 0; i < 20; ++i) {
        const status = tutorModStatusIndex[id].modStatus[i];
        if (typeof status !== "string" || !status.startsWith("available")) continue;
        popoverContent.append(ui_1.ButtonWidget(String(i + 1) + (status === "availablePref" ? "*" : ""), () => {
          const arr = editedDropInModsIndex[id]; // add the new mod

          arr.push(i + 1); // sort

          arr.sort(); // edit status index

          tutorModStatusIndex[id].modStatus[i] = tutorModStatusIndex[id].modStatus[i] === "availablePref" ? "dropInPref" : "dropIn"; // hide popover

          element.popover("hide"); // rebind data handler

          generatePopupSchedule(id, i + 1);
        }).dom);
      }

      return popoverContent;
    }

    popupUtilPlaceElement(availableDomA, availableDomB, {
      mod,
      element,
      popoverContent
    });
  }

  function generatePopupSchedule(id, mod) {
    const initialStatus = tutorModStatusIndex[id].modStatus[mod - 1];

    if (typeof initialStatus !== "string") {
      throw new Error("typecheck failed in generatePopupSchedule");
    }

    const element = shared_1.container('<li class="list-group-item list-group-item-action">')(shared_1.tutors.createLabel(id, x => x.friendlyFullName), initialStatus.endsWith("Pref") ? "*" : "");

    if (initialStatus.endsWith("Pref")) {
      element.addClass("text-primary");
    }

    function popoverContent() {
      const popoverContent = shared_1.container('<div class="btn-group m-2">')();
      popoverContent.append(ui_1.ButtonWidget(`(${popupUtilCountUnavailable(id)}x)`, () => {}).dom);

      for (let i = 0; i < 20; ++i) {
        const status = tutorModStatusIndex[id].modStatus[i];
        if (typeof status !== "string" || !status.startsWith("available")) continue;
        popoverContent.append(ui_1.ButtonWidget(String(i + 1) + (status === "availablePref" ? "*" : ""), () => {
          // remove the mod
          const arr = editedDropInModsIndex[id];
          arr.splice(arr.indexOf(mod), 1); // add the mod

          arr.push(i + 1); // sort

          arr.sort(); // edit status index

          tutorModStatusIndex[id].modStatus[mod - 1] = tutorModStatusIndex[id].modStatus[mod - 1] === "dropInPref" ? "availablePref" : "available";
          tutorModStatusIndex[id].modStatus[i] = tutorModStatusIndex[id].modStatus[i] === "availablePref" ? "dropInPref" : "dropIn"; // dispose popover

          element.popover("dispose"); // destroy element

          element.remove(); // recreate popup

          generatePopupSchedule(id, i + 1);
        }).dom);
      }

      popoverContent.append(ui_1.ButtonWidget("X", () => {
        // remove the mod entirely
        const arr = editedDropInModsIndex[id];
        arr.splice(arr.indexOf(mod), 1); // sort

        arr.sort(); // edit status index

        tutorModStatusIndex[id].modStatus[mod - 1] = tutorModStatusIndex[id].modStatus[mod - 1] === "dropInPref" ? "availablePref" : "available"; // detach element

        element.detach(); // dispose popover

        element.popover("dispose");
      }).dom);
      return popoverContent;
    }

    popupUtilPlaceElement(scheduleDomA, scheduleDomB, {
      mod,
      element,
      popoverContent
    });
  }

  function generatePopupScheduleMatch(id, mod) {
    const initialStatus = tutorModStatusIndex[id].modStatus[mod - 1];

    if (!Array.isArray(initialStatus)) {
      throw new Error("typecheck failed in generatePopupScheduleMatch");
    }

    const matchingId = initialStatus[1];
    const element = shared_1.container('<li class="text-danger list-group-item">')(shared_1.matchings.createLabel(matchingId, x => shared_1.tutors.createLabel(x.tutor, y => y.friendlyFullName) + " (matched)"));

    function popoverContent() {
      return shared_1.container("<span>")("Details:", shared_1.matchings.createDomLabel(matchingId, x => shared_1.container("<span>")(shared_1.tutors.createFriendlyMarker(x.tutor, y => y.friendlyFullName), " <> ", shared_1.learners.createFriendlyMarker(x.learner, y => y.friendlyFullName))));
    }

    popupUtilPlaceElement(scheduleDomA, scheduleDomB, {
      mod,
      element,
      popoverContent
    });
  }

  function generatePopupScheduleBook(id, mod, bookingId) {
    const initialStatus = tutorModStatusIndex[id].modStatus[mod - 1];

    if (!Array.isArray(initialStatus)) {
      throw new Error("typecheck failed in generatePopupScheduleBook");
    }

    const element = shared_1.container('<li class="text-danger list-group-item list-group-item-action">')(shared_1.tutors.createLabel(id, x => x.friendlyFullName), " (booked)");

    function popoverContent() {
      return shared_1.container("<span>")("Details:", shared_1.bookings.createDomLabel(bookingId, x => shared_1.container("<span>")(shared_1.tutors.createFriendlyMarker(x.tutor, y => y.friendlyFullName), " <> ", shared_1.requests.createFriendlyMarker(x.request, y => "link to request", () => renavigate(["requests", x.request], false)))));
    }

    popupUtilPlaceElement(scheduleDomA, scheduleDomB, {
      mod,
      element,
      popoverContent
    });
  }

  for (const {
    id,
    modStatus
  } of Object.values(tutorModStatusIndex)) {
    for (let i = 0; i < 20; ++i) {
      const status = modStatus[i];

      if (Array.isArray(status)) {
        if (status[0] === "matched") {
          generatePopupScheduleMatch(id, i + 1);
        }

        if (status[0] === "booked") {
          generatePopupScheduleBook(id, i + 1, status[1]);
        }
      }

      if (typeof status === "string") {
        if (status.startsWith("dropIn")) {
          generatePopupAvailable(id, i + 1);
          generatePopupSchedule(id, i + 1);
        }

        if (status.startsWith("available")) {
          generatePopupAvailable(id, i + 1);
        }
      }
    }
  }

  function generateMainContentPanel(newNavigationState) {
    const day = newNavigationState[0];
    return shared_1.container('<div class="layout-h">')(shared_1.container('<div class="layout-v">')(shared_1.container('<h1 class="text-center layout-item-fit">')("Available"), shared_1.container('<div class="overflow-auto p-2">')(availableDomA.addClass("overflow-auto").toggleClass("d-none", !day.includes("A")), availableDomB.addClass("overflow-auto").toggleClass("d-none", !day.includes("B")))), shared_1.container('<div class="layout-v">')(shared_1.container('<h1 class="text-center layout-item-fit">')("Schedule", ui_1.ButtonWidget("Save", () => onSave()).dom, ui_1.ButtonWidget("A days", () => renavigate(["scheduleEdit", "A"], true)).dom, ui_1.ButtonWidget("B days", () => renavigate(["scheduleEdit", "B"], true)).dom, ui_1.ButtonWidget("Both days", () => renavigate(["scheduleEdit", "AB"], true)).dom), shared_1.container('<div class="overflow-auto p-2">')(scheduleDomA.toggleClass("d-none", !day.includes("A")), scheduleDomB.toggleClass("d-none", !day.includes("B")))));
  }

  return {
    generateMainContentPanel
  };
}

function attendanceNavigationScope(renavigate) {
  const t = Object.values(shared_1.tutors.state.getRecordCollectionOrFail());
  const l = Object.values(shared_1.learners.state.getRecordCollectionOrFail());
  const sidebarTable = Table_1.TableWidget( // Both learners and tutors are students.
  ["Student", "Total minutes", "Attendance level", "Details"], ({
    isLearner,
    student
  }) => {
    // calculate the attendance level & totals
    let numPresent = 0;
    let numExcused = 0;
    let numAbsent = 0;
    let totalMinutes = 0;

    if (student.additionalHours !== undefined) {
      totalMinutes += student.additionalHours;
    }

    for (const x of Object.values(student.attendance)) {
      for (const {
        minutes
      } of x) {
        if (minutes === 1) {
          ++numExcused;
        } else if (minutes <= 0) {
          ++numAbsent;
        } else {
          ++numPresent;
        }

        totalMinutes += minutes;
      }
    }

    return [(isLearner ? shared_1.learners : shared_1.tutors).createLabel(student.id, x => x.friendlyFullName), String(totalMinutes), `${numPresent}P / ${numExcused}EX / ${numAbsent}A`, ui_1.ButtonWidget("Details", () => {
      renavigate(["attendance", student.id], true);
    }).dom];
  });
  const data = t.map(x => ({
    isLearner: false,
    student: x
  })).concat(l.map(x => ({
    isLearner: true,
    student: x
  })));
  sidebarTable.setAllValues(data);
  return {
    generateMainContentPanel(navigationState) {
      const studentId = navigationState[0];

      if (studentId === undefined) {
        return null;
      }

      const matchingStudents = data.filter(x => x.student.id === studentId);

      if (matchingStudents.length !== 1) {
        throw new Error("no matching students with ID");
      }

      const {
        isLearner,
        student
      } = matchingStudents[0];
      const header = shared_1.container("<h1>")((isLearner ? shared_1.learners : shared_1.tutors).createFriendlyMarker(student.id, x => x.friendlyFullName));
      const attendanceAnnotation = ui_1.FormTextareaWidget();
      attendanceAnnotation.setValue(student.attendanceAnnotation);
      attendanceAnnotation.onChange(newVal => __awaiter(this, void 0, void 0, function* () {
        student.attendanceAnnotation = newVal;

        try {
          server_1.getResultOrFail((yield (isLearner ? shared_1.learners : shared_1.tutors).state.updateRecord(student)));
        } catch (e) {
          shared_1.alertError(e);
        }
      }));
      const table = Table_1.TableWidget( // Both learners and tutors are students.
      ["Date", "Mod", "Present?"], attendanceEntry => {
        return [new Date(attendanceEntry.date).toISOString().substring(0, 10), String(attendanceEntry.mod), attendanceEntry.minutes > 0 ? `P (${attendanceEntry.minutes} minutes)` : $('<span style="color:red">ABSENT</span>')];
      });
      const attendanceData = [];

      for (const x of Object.values(student.attendance)) {
        for (const y of x) {
          attendanceData.push(y);
        }
      }

      table.setAllValues(attendanceData);
      return shared_1.container("<div>")(header, $('<p class="lead">Attendance annotation:</p>'), attendanceAnnotation.dom, table.dom);
    },

    sidebar: shared_1.container("<div>")($("<h1>Attendance</h1>"), sidebarTable.dom)
  };
}

function homepageNavigationScope() {
  return {
    generateMainContentPanel: () => shared_1.container("<h1>")("ARC App homepage")
  };
}

function aboutNavigationScope() {
  return {
    generateMainContentPanel: () => shared_1.container("<div>")(shared_1.container("<h1>")("About"), shared_1.container("<p>")("Designed by Suhao Jeffrey Huang"))
  };
}
/*

ROOT WIDGET

(MAIN ENTRYPOINT)

*/


function rootWidget() {
  let navigationState = [];
  let currentNavigationScope = homepageNavigationScope();

  function renavigate(newNavigationState, keepScope) {
    console.log(newNavigationState, keepScope);

    try {
      navigationState = newNavigationState;

      if (keepScope) {
        if (navigationState[0] === "requests") {
          currentNavigationScope.generateMainContentPanel([navigationState[1]]);
        }

        if (navigationState[0] === "attendance") {
          currentNavigationScope.generateMainContentPanel([navigationState[1]]);
        }

        if (navigationState[0] === "scheduleEdit") {
          currentNavigationScope.generateMainContentPanel([navigationState[1]]);
        }
      } else {
        if (newNavigationState[0] === undefined) {
          currentNavigationScope = homepageNavigationScope();
        }

        if (navigationState[0] === "about") {
          currentNavigationScope = aboutNavigationScope();
        }

        if (navigationState[0] === "requests") {
          currentNavigationScope = requestsNavigationScope(renavigate);
        }

        if (navigationState[0] === "scheduleEdit") {
          currentNavigationScope = scheduleEditNavigationScope(renavigate);
        }

        if (navigationState[0] === "scheduleView") {
          //currentNavigationScope = scheduleViewNavigationScope()
          ui_1.showModal("Not supported", "The view schedule feature is not supported. You shouldn't need it.", bb => [bb("OK", "primary")]);
        }

        if (navigationState[0] === "attendance") {
          currentNavigationScope = attendanceNavigationScope(renavigate);
        }

        generateSidebar(currentNavigationScope.sidebar, keepScope);
      }

      generateMainContentPanel(currentNavigationScope.generateMainContentPanel(navigationState.slice(1)), keepScope);
    } catch (e) {
      shared_1.alertError(e); // TODO
    }
  }

  function generateSidebar(content, keepScope) {
    if (!keepScope) {
      // deal with popovers
      $(".popover").popover("dispose");
    } else {
      $(".popover").popover("hide");
    }

    sidebarDom.empty();
    sidebarDom.removeClass("col-4 overflow-auto app-sidebar d-none");

    if (content) {
      sidebarDom.addClass("col-4 overflow-auto app-sidebar");
      sidebarDom.append(content);
    } else {
      sidebarDom.addClass("d-none");
    }
  }

  function generateMainContentPanel(content, keepScope) {
    if (!keepScope) {
      // deal with popovers
      $(".popover").popover("dispose");
    } else {
      $(".popover").popover("hide");
    }

    mainContentPanelDom.empty();
    mainContentPanelDom.removeClass("col app-content-panel layout-v");

    if (content) {
      mainContentPanelDom.append(content);
      mainContentPanelDom.addClass("col app-content-panel layout-v");
    }
  }

  function generateNavigationBar() {
    const dom = $(navigationBarString);
    dom.find("a").css("cursor", "pointer").click(ev => {
      function command(name, textName, loadingMessage, finish) {
        if (text == textName) {
          ;

          (() => __awaiter(this, void 0, void 0, function* () {
            const {
              closeModal
            } = ui_1.showModal(loadingMessage, "", bb => []);

            try {
              const result = server_1.getResultOrFail((yield server_1.askServer(["command", name])));
              yield finish(result);
            } catch (e) {
              shared_1.alertError(e);
            } finally {
              closeModal();
            }
          }))();
        }
      }

      ev.preventDefault();
      const text = $(ev.target).text(); // DATA EDITOR
      // the data editor isn't considered a navigation state

      if (text == "Tutors") shared_1.tutors.makeTiledViewAllWindow();
      if (text == "Learners") shared_1.learners.makeTiledViewAllWindow();
      if (text == "Bookings") shared_1.bookings.makeTiledViewAllWindow();
      if (text == "Matchings") shared_1.matchings.makeTiledViewAllWindow();
      if (text == "Request submissions") shared_1.requestSubmissions.makeTiledViewAllWindow();
      if (text == "Requests") shared_1.requests.makeTiledViewAllWindow(); // SCHEDULER

      if (text == "Handle requests") {
        renavigate(["requests"], false);
      }

      if (text == "Edit schedule") {
        renavigate(["scheduleEdit", "A"], false);
      }

      if (text == "View schedule") {
        renavigate(["scheduleView"], false);
      } // ATTENDANCE


      if (text == "Attendance") {
        renavigate(["attendance"], false);
      } // COMMANDS


      command("syncDataFromForms", "Sync data from forms", "Syncing data...", result => __awaiter(this, void 0, void 0, function* () {
        ui_1.showModal("Sync successful", `${result} new form submissions found`, bb => [bb("OK", "primary")]);
      }));
      command("generateSchedule", "Generate schedule", "Generating schedule...", result => __awaiter(this, void 0, void 0, function* () {
        ui_1.showModal("Schedule successfully generated", `The schedule in the spreadsheet has been updated`, bb => [bb("OK", "primary")]);
      }));
      command("recalculateAttendance", "Recalculate attendance", "Recalculating attendance...", result => __awaiter(this, void 0, void 0, function* () {
        ui_1.showModal(`Attendance successfully recalculated: ${result} attendances were modified`, "", bb => [bb("OK", "primary")]);
      })); // MISC

      if (text == "After-school availability") {
        showAfterSchoolAvailablityModal();
      }

      if (text == "About") {
        renavigate(["about"], false);
      }

      if (text == "Force refresh") {
        ;

        (() => __awaiter(this, void 0, void 0, function* () {
          const {
            closeModal
          } = ui_1.showModal("Loading force refresh...", "", bb => [], true);
          yield shared_1.tutors.state.forceRefresh();
          yield shared_1.learners.state.forceRefresh();
          yield shared_1.bookings.state.forceRefresh();
          yield shared_1.matchings.state.forceRefresh();
          yield shared_1.requests.state.forceRefresh();
          yield shared_1.requestSubmissions.state.forceRefresh();
          renavigate(navigationState, false);
          closeModal();
        }))();
      }

      if (text == "Testing mode") {
        window["APP_DEBUG_MOCK"] = 1;
        shared_1.tutors.state.forceRefresh();
        shared_1.learners.state.forceRefresh();
        shared_1.bookings.state.forceRefresh();
        shared_1.matchings.state.forceRefresh();
        shared_1.requests.state.forceRefresh();
        shared_1.requestSubmissions.state.forceRefresh();

        for (const window of shared_1.state.tiledWindows.val) {
          window.onLoad.trigger();
        }

        showTestingModeWarning();
      }
    });
    return dom[0];
  }

  const sidebarDom = shared_1.container("<div></div>")();
  const mainContentPanelDom = shared_1.container("<div></div>")();
  const dom = shared_1.container('<div id="app" class="layout-v"></div>')(shared_1.container('<nav class="navbar layout-item-fit">')($('<strong class="mr-4">ARC</strong>'), generateNavigationBar()), shared_1.container('<div class="row m-4 layout-h">')(sidebarDom, mainContentPanelDom));
  if (window["APP_DEBUG_MOCK"] === 1) showTestingModeWarning();
  return {
    dom
  };
}

exports.rootWidget = rootWidget;
},{"./shared":"m0/6","../widgets/ui":"T2q6","../widgets/Table":"Jwlf","./server":"ZgGC"}],"7QCb":[function(require,module,exports) {
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

console.log("hi there!");

window["appOnReady"] = () => __awaiter(this, void 0, void 0, function* () {
  // TODO: replace with proper loading widget
  $("body").append($('<h1 id="app">Loading...</h1>'));
  yield shared_1.initializeResources();
  $("body").empty();
  $("body").append(widget_1.rootWidget().dom);
});

$(document).ready(window["appOnReady"]);
},{"./core/shared":"m0/6","./core/widget":"o4ND"}]},{},["7QCb"], null)


/* Automatically built on 2019-09-12 21:21:46 */

