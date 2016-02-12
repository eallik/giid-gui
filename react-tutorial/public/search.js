function mapFromList(xs) { return xs.reduce((acc, x) => { acc[x[0]] = x[1]; return acc; }, {}); }

var LANG_ALL = [
  ["en", [["us", "uk"], "English"]],
  ["et", [["ee"],       "Eesti keel"]],
  ["fi", [["fi"],       "Suomi"]],
  ["ru", [["fo"],       "Русский"]],
  ["sw", [["fo"],       "Swedish"]],
  ["de", [["fo"],       "Deutsch"]],
  ["fr", [["fo"],       "Français"]],
  ["es", [["fo"],       "Español"]],
  ["it", [["fo"],       "Italiano"]],
  ["pt", [["fo"],       "Português"]],
].sort();
var _LANG_ALL_LOOKUP = mapFromList(LANG_ALL);

function langIcoUriAndLabelDefault(langCode) {
  return langIcoUriAndLabelWithGeom([128,128], langCode);
}
function langIcoUriAndLabelWithGeom(geom, langCode) {
  var [w,h]             = geom,
      [ctryCodes,label] = _LANG_ALL_LOOKUP[langCode],
      uri               = ("/img/" + langCode + "_" + ctryCodes.join('+') 
                           +"_"+ w+"x"+h
                           +".png");
  return [uri, label];
}

var LanguageSelection = React.createClass({
  itemStyle: {
    display: "inline-block",
    padding: "3px"
  },
  getInitialState: function() { return {sel: this.props.selected}; },
  handleLangCode: function(e) { e.preventDefault(); },
  onAddLangCode: function(langCode) {
    console.debug('onAddLangCode');
    if (this.state.sel.indexOf(langCode) === -1)
      this.setState({languageCodes: this.state.sel.concat([langCode])});
  },
  getUnselected: function() {
    return this.props.all.filter((i) => this.state.sel.indexOf(i) === -1);
  },
  render: function() {
    var languageSelectors = this.state.sel.map(function(langCode) {
      return (
        <button
          ref={langCode}
          key={langCode}
          style={this.itemStyle}
          className="languageSelector"
          onClick={this.handleLangCode}
        >{langCode}</button>
      );
    }.bind(this));
    return (
      <div className="languageSelection">
        {languageSelectors}
        <InlinePicker options={this.getUnselected()} onAdd={this.onAddLangCode}/>
      </div>
    );
  }
});

var InlinePicker = React.createClass({
  getInitialState: function() {
    return {
      isAdding: false
    };
  },
  handleAdd:    function(e) { this.setState({isAdding: true }); },
  handleCancel: function(e) { this.setState({isAdding: false}); },
  handleSelect: function(e) {
    this.setState({isAdding: false});
    this.props.onAdd(e.target.value);
  },
  render: function() {
    var addBtn =
      <button onClick={this.handleAdd}>+</button>;
    var options = this.props.options.map((opt) => <option value={opt}>Spanish/Español</option>);
    var selectBox = (
      <div>
        <select className="languagePicker" onChange={this.handleSelect}>
          <option>pick language</option>
          
          <option value="fr">French/Français</option>
        </select>
        <button onClick={this.handleCancel}>X</button>
      </div>
    );
    return (
      <div className="languagePicker" style={{display: "inline-block"}}>
        {this.state.isAdding ? selectBox : addBtn}
      </div>
    );
  }
});

window.Search = React.createClass({
  style: {
    backgroundColor: "yellow",
    height: "100%"
  },
  render: function() {
    return (
      <div className="search" style={this.style}>
        <LanguageSelection selected={["en","ee"]} all={LANG_ALL} />
      </div>
    );
  }
});
