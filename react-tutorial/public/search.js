// use ReactJS components ONLY FOR RENDERING
//
// terminology:
//
// * component -- contains a rendering, delegates user actions to the controller
// * rendering -- the output of React components' rendering, based on templates
//   in the render methods
// * view -- the data structure from which React components' compute the rendering
// * controller -- handles events from its matching React component and updates the view
//
// the entire app is a hierarchy; each node in the hierarchy corresponds to a
// component; each component has a view it has to render, and an accompanying
// controller it sends its events to.  regular components delegate all state
// management to their controller; only ephemeral subcomponents are allowed to
// be treated as black boxes with their private internal state, whose only
// output is their result, but that result is then recorded as an event in the
// parent component and sent to the controller anyway.
//
// therefore state is only ever bubbled up the hierarchy to the nearest
// non-ephemeral component. also, ephemeral components are often "promoted" to
// proper components that participate in the hierarchy directly, in which case
// it is allotted a place in the hierarchy and assigned a view and controller.

var SelectBox = React.createClass({
  getInitialState: function() { return {isModifying: false, selected: this.props.selected}; },

  onBeginSelection: function(e) { this.setState({isModifying: true}); },
  onEndSelection  : function(e) { this.setState({isModifying: false}); },

  onYieldSelection: function(values) {
    console.debug(values);
    this.setState({selected: values});
  },
  render: function() {
    var picker = (
        <SelectPicker
          selected={this.state.selected} all={this.props.all}
          onYield={this.onYieldSelection}
          onDone={this.onEndSelection}
        />
    );
    var selectedItems = this.state.selected.map(x => <img width="40px" height="28px" style={{padding: "2px"}} key={x.key} alt={x.label} src={x.iconUri()} />);
    return (
        <div className="select-box" style={{position: "relative"}}>
          <div style={{position: "absolute", zIndex: navigator.platform === "iPhone" ? -1 : 2}}>
            {this.state.isModifying ? picker : null}
          </div>
          <div style={{position: "absolute", zIndex:  1}} onClick={this.onBeginSelection}>
            {selectedItems}
          </div>
        </div>
    );
  }
});


var SelectPicker = React.createClass({
  getInitialState: function() { return {selected: this.props.selected}; },
  componentDidMount: function() { this.refs.select.focus(); },
  isSelected: function(key) { return this.props.selected.some(x => x.key === key); },
  onChange: function(e) {
    var vals = $(e.target).val().map(key => this.props.all.find(x => x.key === key));
    this.setState({selected: vals});
    this.props.onYield(vals);
  },
  render: function() {
    var options = this.props.all.map(
      ({key,label}) => <option key={key} value={key}>{label}</option>
    );
    // XXX: the dummy optgroup is needed; otherwise iOS safari auto-unselects the first value for some reason
    return (
        <select style={{appearance: "none"}} ref="select" value={this.state.selected.map(x => x.key)} onChange={this.onChange} className="select-picker" multiple="multiple" onBlur={this.props.onDone}>
          <optgroup disabled></optgroup>
          {options}
        </select>
    );
  }
});


//////////////////////////

var Search = React.createClass({
  style: { height: "100%" },
  bgStyle: {
    backgroundImage: (new Date()).getMinutes() % 2 == 0 ? "url(/img/bg_rome3.jpg)" : "url(/img/bg_paris.jpg)",
    backgroundPosition: "center center", backgroundSize: "auto 100%", backgroundRepeat: "no-repeat",
    WebkitFilter: "blur(5px)",

    position: "fixed", left: 0, right: 0, top: 0, bottom: 0, zIndex: 1
  },
  contentStyle: {
    position: "fixed", left: 0, right: 0, zIndex: 9999
  },
  render: function() {
    var selectedLangs = [
      _LANG_ALL_LOOKUP["en"],
      _LANG_ALL_LOOKUP["et"]
    ];
    return (
      <div className="search" style={this.style}>
        <div style={this.bgStyle}></div>
        <div style={this.contentStyle}>
          <SelectBox selected={selectedLangs} all={LANG_ALL} />
        </div>
      </div>
    );
  }
});


///////////////////////////

function mapFromList(xs) { return xs.reduce((acc, y) => { acc[y[0]] = y[1]; return acc; }, {}); }


//////////////////////////

function Language(attrs) { Object.assign(this, attrs); }
Language.prototype = {
  iconUri: function() {
    return this.icoUriWithGeom({w:128,h:128});
  },
  icoUriWithGeom: function(geom) {
    return ("/img/" + this.key + "_" + this.ctryCodes.join('+')
            + "_" + geom.w+"x"+geom.h + ".png");
  }
}

var LANG_ALL = [
  {key: "en", ctryCodes: ["us", "uk"], label: "English"},
  {key: "et", ctryCodes: ["ee"],       label: "Eesti keel"},
  {key: "fi", ctryCodes: ["fi"],       label: "Suomi"},
  {key: "ru", ctryCodes: ["rf"],       label: "Ру́сский"},
  {key: "sw", ctryCodes: ["se"],       label: "Svenska"},
  {key: "de", ctryCodes: ["de"],       label: "Deutsch"},
  {key: "fr", ctryCodes: ["fr"],       label: "Français"},
  {key: "es", ctryCodes: ["es"],       label: "Español"},
  {key: "it", ctryCodes: ["it"],       label: "Italiano"},
  {key: "pt", ctryCodes: ["pt", "br"],       label: "Português"},
].map(y => new Language(y));

var _LANG_ALL_LOOKUP = mapFromList(
  LANG_ALL.map(y => [y.key, y])
);

window.LANG_ALL = LANG_ALL;
window._LANG_ALL_LOOKUP = _LANG_ALL_LOOKUP;
window.Search = Search;
