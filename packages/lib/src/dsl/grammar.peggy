{{
function collectBody(members) {
  const result = {
    properties: [],
    data: null,
    highlights: [],
    areaFills: [],
    annotations: [],
    series: [],
    scenes: [],
    transforms: [],
  };
  for (const m of members) {
    switch (m.type) {
      case 'property':  result.properties.push(m); break;
      case 'data':       result.data = m;           break;
      case 'highlight':  result.highlights.push(m); break;
      case 'areafill':   result.areaFills.push(m);  break;
      case 'annotation': result.annotations.push(m);break;
      case 'series':     result.series.push(m);     break;
      case 'scene':      result.scenes.push(m);     break;
      case 'transform':  result.transforms.push(m); break;
    }
  }
  return result;
}

function collectSceneBody(members) {
  const result = {
    properties: [],
    data: null,
    highlights: [],
    areaFills: [],
    annotations: [],
    annotationVisibility: [],
    series: [],
    transforms: [],
  };
  for (const m of members) {
    switch (m.type) {
      case 'property':  result.properties.push(m); break;
      case 'data':       result.data = m;           break;
      case 'highlight':  result.highlights.push(m); break;
      case 'areafill':   result.areaFills.push(m);  break;
      case 'annotation': result.annotations.push(m);break;
      case 'annotation-visibility': result.annotationVisibility.push(m); break;
      case 'series':     result.series.push(m);     break;
      case 'transform':  result.transforms.push(m); break;
    }
  }
  return result;
}
}}

Chart
  = _ "chart" __ chartType:Identifier _ "{" _ members:ChartMember* _ "}" _
  {
    const body = collectBody(members);
    return {
      type: 'chart',
      chartType,
      properties: body.properties,
      data: body.data,
      highlights: body.highlights,
      areaFills: body.areaFills,
      annotations: body.annotations,
      series: body.series,
      scenes: body.scenes,
      transforms: body.transforms,
    };
  }

ChartMember
  = _ m:(DataBlock / Highlight / AreaFill / RangeAnnotation / NoteAnnotation / Annotation / Series / Scene / Transform / Property) _
  { return m; }

DataBlock
  = "data" _ "{" _ entries:(TabularDataEntry / DataEntry)* _ "}"
  { return { type: 'data', entries }; }

DataEntry
  = _ p:Property _ { return p; }

TabularDataEntry
  = _ label:TabularLabel "\t" _ value:PropertyValue _
  { return { type: 'property', key: label, value: value.value, isPercentage: value.isPercentage }; }

TabularLabel
  = chars:$([^\t\n\r{}=]+) { return chars.trim(); }

Highlight
  = "highlight" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'highlight', target, properties: props }; }

AreaFill
  = "areafill" __ from:String __ to:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'areafill', from, to, properties: props }; }

Annotation
  = "annotation" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'annotation', kind: 'point', target, properties: props }; }

RangeAnnotation
  = "range" _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'annotation', kind: 'range', properties: props }; }

NoteAnnotation
  = "note" _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'annotation', kind: 'free', properties: props }; }

Series
  = "series" __ name:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'series', name, properties: props }; }

Scene
  = ("scene" / "step") __ name:String? _ "{" _ members:SceneMember* _ "}"
  {
    const body = collectSceneBody(members);
    return {
      type: 'scene',
      name: name ?? null,
      properties: body.properties,
      data: body.data,
      highlights: body.highlights,
      areaFills: body.areaFills,
      annotations: body.annotations,
      annotationVisibility: body.annotationVisibility,
      series: body.series,
      transforms: body.transforms,
    };
  }

Transform
  = "transform" __ transformType:Identifier _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'transform', transformType, properties: props }; }

HideAnnotation
  = "hide_annotation" __ id:String
  { return { type: 'annotation-visibility', action: 'hide', kind: 'point', id }; }

HideRange
  = "hide_range" __ id:String
  { return { type: 'annotation-visibility', action: 'hide', kind: 'range', id }; }

HideNote
  = "hide_note" __ id:String
  { return { type: 'annotation-visibility', action: 'hide', kind: 'free', id }; }

ShowAnnotation
  = "show_annotation" __ id:String
  { return { type: 'annotation-visibility', action: 'show', kind: 'point', id }; }

ShowRange
  = "show_range" __ id:String
  { return { type: 'annotation-visibility', action: 'show', kind: 'range', id }; }

ShowNote
  = "show_note" __ id:String
  { return { type: 'annotation-visibility', action: 'show', kind: 'free', id }; }

SceneMember
  = _ m:(DataBlock / Highlight / AreaFill / RangeAnnotation / NoteAnnotation / Annotation / HideAnnotation / HideRange / HideNote / ShowAnnotation / ShowRange / ShowNote / Series / Transform / Property) _
  { return m; }

BlockProperty
  = _ p:Property _ { return p; }

Property
  = key:PropertyKey _ "=" _ value:PropertyValue
  { return { type: 'property', key, value: value.value, isPercentage: value.isPercentage }; }

PropertyKey
  = String / Identifier

PropertyValue
  = n:Number "%" { return { value: n, isPercentage: true }; }
  / n:Number     { return { value: n, isPercentage: false }; }
  / s:String     { return { value: s, isPercentage: false }; }
  / id:Identifier { return { value: id, isPercentage: false }; }

Identifier "identifier"
  = $([a-zA-Z_#] [a-zA-Z0-9_#-]*)

Number
  = digits:$("-"? [0-9]+ ("." [0-9]+)?) { return parseFloat(digits); }

String "string"
  = '"' chars:StringChar* '"' { return chars.join(''); }

StringChar
  = '\\' c:EscapeChar { return c; }
  / [^"\\]

EscapeChar
  = '"'  { return '"'; }
  / '\\' { return '\\'; }
  / 'n'  { return '\n'; }
  / 't'  { return '\t'; }
  / c:.  { return c; }

__ "whitespace"
  = [ \t\n\r]+

_ "optional whitespace"
  = [ \t\n\r]*
