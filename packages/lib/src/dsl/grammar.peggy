{{
function collectBody(members) {
  const result = {
    properties: [],
    data: null,
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],
    annotationVisibility: [],
    series: [],
    scenes: [],
    transforms: [],
  };
  for (const m of members) {
    switch (m.type) {
      case 'property':  result.properties.push(m); break;
      case 'data':
        if (result.data !== null) {
          throw new SyntaxError('duplicate data block');
        }
        result.data = m;
        break;
      case 'colorize':   result.colorizes.push(m);  break;
      case 'highlight':  result.highlights.push(m); break;
      case 'areafill':   result.areaFills.push(m);  break;
      case 'annotation': result.annotations.push(m);break;
      case 'annotation-visibility': result.annotationVisibility.push(m); break;
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
    colorizes: [],
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
      case 'data':
        if (result.data !== null) {
          throw new SyntaxError('duplicate data block');
        }
        result.data = m;
        break;
      case 'colorize':   result.colorizes.push(m);  break;
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
      colorizes: body.colorizes,
      highlights: body.highlights,
      areaFills: body.areaFills,
      annotations: body.annotations,
      annotationVisibility: body.annotationVisibility,
      series: body.series,
      scenes: body.scenes,
      transforms: body.transforms,
    };
  }

ChartMember
  = _ m:(DataBlock / Colorize / Highlight / AreaFill / RangeAnnotation / NoteAnnotation / Annotation / HideAnnotation / HideRange / HideNote / ShowAnnotation / ShowRange / ShowNote / Series / Scene / Transform / Property) _
  { return m; }

DataBlock
  = "data" _ "{" _ entries:(TabularDataEntry / DataEntry)* _ "}"
  { return { type: 'data', entries }; }

DataEntry
  = _ key:PropertyKey _ "=" _ first:PropertyValue rest:("," _ v:PropertyValue { return v; })+ _
  {
    const all = [first, ...rest];
    return { type: 'property', key, value: all[0].value, isPercentage: false, values: all.map(v => v.value) };
  }
  / _ p:Property _ { return p; }

TabularDataEntry
  = _ label:TabularLabel "\t" _ value:PropertyValue _
  { return { type: 'property', key: label, value: value.value, isPercentage: value.isPercentage }; }

TabularLabel
  = chars:$([^\t\n\r{}=]+) { return chars.trim(); }

Colorize
  = "colorize" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'colorize', target, properties: props }; }

Highlight
  = "highlight" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'highlight', target, properties: props }; }
  / "highlight" __ target:String
  { return { type: 'highlight', target, properties: [] }; }

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
      colorizes: body.colorizes,
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
  = _ m:(DataBlock / Colorize / Highlight / AreaFill / RangeAnnotation / NoteAnnotation / Annotation / HideAnnotation / HideRange / HideNote / ShowAnnotation / ShowRange / ShowNote / Series / Transform / Property) _
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
  = digits:$("-"? ("." [0-9]+ / [0-9]+ ("." [0-9]*)?) ([eE] [+-]? [0-9]+)?) { return parseFloat(digits); }

String "string"
  = '"' chars:StringChar* '"' { return chars.join(''); }

StringChar
  = '\\' c:EscapeChar { return c; }
  / [^"\\]

EscapeChar
  = '"'  { return '"'; }
  / '\\' { return '\\'; }
  / 'n'  { return '\n'; }
  / 'r'  { return '\r'; }
  / 't'  { return '\t'; }
  / 'u' hex:$([0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]) { return String.fromCharCode(parseInt(hex, 16)); }
  / c:.  { error("Unknown escape sequence \\" + c); }

Comment
  = LineComment
  / BlockComment

LineComment
  = "//" [^\n]*

BlockComment
  = "/*" (!"*/" .)* "*/"

__ "whitespace"
  = ([ \t\n\r] / Comment)+

_ "optional whitespace"
  = ([ \t\n\r] / Comment)*
