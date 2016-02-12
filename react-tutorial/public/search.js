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

var BG_ALL = [
  "tallinn", 
  "paris",
  "bridge",
];

var SelectBox = React.createClass({
  getInitialState: function() { return {isModifying: false}; },

  onBeginSelection: function(e) { this.setState({isModifying: true}); },
  onEndSelection  : function(e) { this.setState({isModifying: false}); },

  onPickerYield: function(values) {
    console.debug(values);
    this.props.onYield(values);
    // this.setState({selected: values});
  },
  render: function() {
    var picker = (
        <SelectPicker
          selected={this.props.selected} all={this.props.all}
          onYield={this.onPickerYield}
          onDone={this.onEndSelection}
        />
    );
    var itemStyle = {
      float: this.props.itemFloat,
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      width: "43px", height: "41px", margin: "4px",
      // borderRadius: "7px"
    };
    var selectedItems = this.props.selected.map(
      x => <img style={itemStyle} key={x.key} alt={x.label} src={x.iconUri()} />
    );
    if (this.props.itemFloat === "right")
      selectedItems.reverse();

    return (
        <div className="select-box" style={{position: "relative"}}>
          <div style={{position: "absolute", zIndex: navigator.platform === "iPhone" ? -1 : 2, opacity: navigator.platform === "iPhone" ? 0.0 : 1.0}}>
            {this.state.isModifying ? picker : null}
          </div>
          <div style={{position: "absolute", zIndex:  1, width: "100%"}} onClick={this.onBeginSelection}>
            {selectedItems}
          </div>
        </div>
    );
  }
});


var SelectPicker = React.createClass({
  componentDidMount: function() { this.refs.select.focus(); },
  isSelected: function(key) { return this.props.selected.some(x => x.key === key); },
  onChange: function(e) {
    var vals = ($(e.target).val() || []).map(key => this.props.all.find(x => x.key === key));
    console.debug("SelectPicker.onChange: ", vals);
    this.props.onYield(vals);
  },
  render: function() {
    var options = this.props.all.map(
      ({key,label}) => <option key={key} value={key}>{label}</option>
    );
    // XXX: the dummy optgroup is needed; otherwise iOS safari auto-unselects the first value for some reason
    return (
        <select style={{appearance: "none"}} ref="select" value={this.props.selected.map(x => x.key)} onChange={this.onChange} className="select-picker" multiple="multiple" onBlur={this.props.onDone}>
          <optgroup disabled></optgroup>
          {options}
        </select>
    );
  }
});


//////////////////////////

var Search = React.createClass({
  getInitialState: function() {
    return {
      langs: ["en", "et"].map(x => _LANG_ALL_LOOKUP[x]),
      topics: ["history", "architecture"].map(x => _TOPIC_ALL_LOOKUP[x])
    };
  },
  style: { height: "100%", position: "relative" },
  bgStyle: {
    backgroundImage: "url(/img/bg_" + BG_ALL[(new Date()).getMinutes() % BG_ALL.length] + ".jpg)",
    backgroundPosition: "center center", backgroundSize: "auto 100%", backgroundRepeat: "no-repeat",
    WebkitFilter: "blur(4px)",

    position: "fixed", left: 0, right: 0, top: 0, bottom: 0, zIndex: 1
  },
  contentStyle: {
    position: "fixed", left: 0, right: 0, zIndex: 9999
  },

  onTopicSelectionChange: function(xs) {
    var overSize = Math.max(0, xs.length - 4);
    this.setState({topics: xs.slice(overSize)});
  },
  onLangSelectionChange : function(xs) {
    var overSize = Math.max(0, xs.length - 4);
    this.setState({langs: xs.slice(overSize)});
  },

  render: function() {
    return (
      <div className="search" style={this.style}>
        <div style={this.bgStyle}></div>
        <div style={this.contentStyle}>
          <div style={{background:"-webkit-linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0))"}}>
            <img style={{margin:"5px 0 0px 10px"}} src="/img/guideme_takemeonatour.png"/>
          </div>
          <div style={{position:"relative"}}>
            <div style={{position: "absolute", left: "0px", right: "50%"}}>
              <SelectBox selected={this.state.langs}  all={LANG_ALL}  onYield={this.onLangSelectionChange}  itemFloat="left"  />
            </div>
            <div style={{position: "absolute", left: "50%", right: "0px"}}>
              <SelectBox selected={this.state.topics} all={TOPIC_ALL} onYield={this.onTopicSelectionChange} itemFloat="right" />
            </div>
          <div style={{position: "absolute", top: "55px", width: "100%"}}>
            <SearchResults items={[]} />
          </div>
          </div>
        </div>
      </div>
    );
  }
});

var SearchResults = React.createClass({
  itemStyle: {height:"110px", backgroundColor:"rgba(255,255,255,0.5)", lineHeight:"1em", overflow:"hidden", position:"relative", margin:"1px"},
  render: function() {
    var items = GUIDES_ALL.map(x => {
      return (
          <div key={x.id} style={this.itemStyle}>
            <div style={{position: "absolute", left:"10px",top:"10px"}}>
              <img src={x.profilePhoto} style={{display:"block", width: "55px", height: "55px", marginBottom:"5px"}} />
            </div>
            <div style={{position: "absolute", left:"80px", top:"10px", fontSize:"11px",textTransform:"uppercase"}}>
              {
                x.certifications.length === 0 
                  ? "tour guide" : x.certifications.map(
                    x => x.type === "certified" ? "certified by " + x.by : x.type === "featured" ? "featured today" : x.type
                  )
              }
            </div>
            <div style={{position: "absolute", left:"80px", top:"26px", fontWeight:"bold"}}>
              {x.name}
            </div>
            <div style={{position: "absolute", left:"80px", top:"45px", fontSize:"10px"}}>
              {x.locations.join(" / ")}
            </div>
            <div style={{position: "absolute", left:"80px", top:"62px", fontSize:"15px",fontWeight:"bold",padding:"6px",backgroundColor:"#FF99C0",borderRadius:"3px",width:"30px",textAlign:"center"}}>
              {x.rating}
            </div>
            <div style={{position:"absolute",right:"20px", top:"62px"}}>
              <PingMeBtn/>
            </div>
          </div>
      );
    });
    return (
        <div style={{left: 0, right: 0}}>
          {items}
        </div>
    );
  }
});

var PingMeBtn = React.createClass({
  getInitialState: function() { return {pressed:false}; },
  render: function() {
      return (
          <div
            onTouchStart={this.onTouchStart} 
            onMouseDown={this.onTouchStart}
            onTouchEnd={this.onTouchEnd}
            onMouseOut={this.onTouchEnd}
            onMouseUp={this.onTouchEnd}
            style={{border:"2px solid rgb(254,255,240)", WebkitUserSelect: "none", textAlign:"left", fontSize:"11px",textTransform:"uppercase",
                    padding:"6px 8px",borderRadius:"3px",width:"70px",
                    background:"#99FFC0 url(/img/bell.png) no-repeat",backgroundPosition:"85% 50%",backgroundSize:"13px 13px",
                    WebkitFilter: this.state.pressed ? "invert(15%)" : "invert(0%)"
                   }}
          >
            ping me
          </div>
      );
  },
  onTouchStart: function(e) { this.setState({pressed:true}); },
  onTouchEnd:  function(e) { this.setState({pressed:false}); }
});

///////////////////////////

function intercalate(sep, xs) { 
  if (xs.length === 0) return [];
  return xs.slice(1).reduceRight((acc, x) => acc.concat([sep]).concat(x), [xs[0]]);
}

function mapFromList(xs) { return xs.reduce((acc, y) => { acc[y[0]] = y[1]; return acc; }, {}); }

//////////////////////////

function Language(attrs) { Object.assign(this, attrs); }
Language.prototype = {
  iconUri: function() {
    return this.iconUriWithGeom({w:128,h:128});
  },
  iconUriWithGeom: function(geom) {
    return ("/img/lang_" + this.key + "_" + this.ctryCodes.join('+')
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
].map(x => new Language(x));

var _LANG_ALL_LOOKUP = mapFromList(
  LANG_ALL.map(x => [x.key, x])
);


function Topic(attrs) { Object.assign(this, attrs); }
Topic.prototype = {
  iconUri: function() {
    return this.iconUriWithGeom({w:128,h:128});
  },
  iconUriWithGeom: function(geom) {
    return ("/img/topic_" + this.key
            + "_" + geom.w+"x"+geom.h + ".png");
  }
}

var TOPIC_ALL = [
  {key: "history",               label: "History"},
  {key: "architecture",          label: "Architecture"},
  {key: "sightseeing",           label: "Sightseeing"},
  {key: "pubsAndBars",           label: "Pubs & Bars"},
  {key: "diningAndRestaurants",  label: "Dining & Restaurants"},
  {key: "beer",                  label: "Beer"},
  {key: "wine",                  label: "Wine"},
  {key: "parksAndWildlife",      label: "Parks & Wildlife"},
  {key: "outdoorAndActivities",  label: "Outdoor & Activites"},
].map(x => new Topic(x));
var _TOPIC_ALL_LOOKUP = mapFromList(
  TOPIC_ALL.map(x => [x.key, x])
);


var GUIDES_ALL = [
  {
    id: "erik" , name: "Erik" , locations: ["Tallinn"],
    certifications: [],
    rating: "9.2",
    profilePhoto: "/img/profile-photos/erik-kilpkonn.jpg"
  },
  {
    id: "timo" , name: "Timo" , locations: ["Tallinn","Helsinki"],
    certifications: [],
    rating: "9.2",
    profilePhoto: "/img/profile-photos/timo-maakler.jpg"
  },
  {
    id: "kaiko", name: "Kaiko", locations: ["Viljandi","Tallinn"],
    certifications: [
      {type:"featured"}
    ],
    rating: "9.3",
    profilePhoto: "/img/profile-photos/kaiko.jpg"
  },
  {
    id: "siim" , name: "Siim" , locations: ["Tallinn"],
    certifications: [
      {type:"certified",by:"Estonian Assoc. of Tourist Guides"}
    ],
    rating: "10.0",
    profilePhoto: "/img/profile-photos/siim.jpg"
  }
];


window.Search = Search;

window.LANG_ALL = LANG_ALL;
window._LANG_ALL_LOOKUP = _LANG_ALL_LOOKUP;
window.GUIDES_ALL = GUIDES_ALL;
