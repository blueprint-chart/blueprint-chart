# Blueprint Chart

Blueprint Chart is a new service to build an publish charts online.

It is based on D3 and the micro-framework [d3-blueprint](http://blueprint.pirhoo.com/).

The objective is to have something as complete as Datawrapper or Flourish for charts.

This is a 100% static tool (like https://www.rawgraphs.io/). To publish a chart, user will getting something like (pseudo-code):

```html
<div id="blueprint-chart-0001" />
<script type="javascript" src="https://blueprintchart.com/lib.js" />
<script type="application/blueprint">
chart horizontal-bar {
  title = "Couverture médiatique"
  sort = descending
  
  data {
    "20 Minutes" = 61.11%
    "BFMTV"      = 53.85%
    "Guardian"   = 44.44%
    "LeMonde"    = 75.00%
  }
  
  highlight "Guardian" {
    color = "#e53e3e"
    label = "Leader"
  }
}
</script>
```

The role of the user interface is to assist the user to create their charts, and then produce a description of the chart in a custom DSL.

User must be able to also build "stories", with chart that transform from one step to another:

```html
<div id="blueprint-chart-0001" />
<script type="javascript" src="https://blueprintchart.com/lib.js" />
<script type="application/blueprint-chart">
chart horizontal-bar {
  title = "Couverture médiatique en 2025"
  sort = descending
  
  data {
    "20 Minutes" = 61%
    "BFMTV"      = 53%
    "Guardian"   = 44%
    "LeMonde"    = 75%
  }

  step "Le leader" {
    sort = descending
    
    highlight "LeMonde" {
      color = "#e53e3e"
      label = "Leader"
    }
  }

  step "Le moins bon" {
    sort = ascending
    
    highlight "Guardian" {
      color = "#45a"
      label = "Le pire"
    }
  }

  step "Année suivante" { 
    title = "Couverture médiatique en 2026"

    data {
      "20 Minutes" = 51%
      "BFMTV"      = 73%
      "Guardian"   = 84%
      "LeMonde"    = 25%
    }
  }
}
</script>
```

The first prototype should support: vertical bar chart, horizontal bar chart, multi bar chart, line chart, multi lines chart, donuts charts, pie charts. Chart can be combined.

## Chart structure

A chart is made of several layers:

* **FRAME** which wraps everything. It includes the follow feature:
  * A sizing convention based on the height:
    * Auto: sets the height based on the chart type, data and width.
    * Standard: uses the default responsive sizing.
    * Aspect ratio: sets the aspect of each plot.
  * A header:
    * A title (optional)
    * A description (optional)
    * A byline (option)
  * A footer
    * A source label (optional)
    * A source URL (optional)
    * Blueprint Chart credit
  
  * **CANVAS** layer which contain the actual chart, map, table, etc. Frame use all the space available in the workspace.

    * **AXIS** layer, show the chart axises (if any)

      * **VERTICAL AXIS** layer:
        * direction: left (default) or right
        * scale type (default): linear, logarrithmic
        * custom range: min and max (default to auto)
        * custom ticks: commat separated list of value  (default to auto)
        * show ticks: boolean to show ticks (default to false)
        * line style: continous, dashed (default), dotted, none
        * number format: common option or custom format based on https://d3js.org/d3-format

      * **HORIZONTAL AXIS** layer:
        * direction: left (default) or right
        * scale type (default): linear, logarrithmic
        * custom range: min and max (default to auto)
        * custom ticks: commat separated list of value  (default to auto)
        * tick position: above (default) or bellow 
        * show ticks: boolean to show ticks (default to false)
        * line style: continous, dashed (default), dotted, none
        * number format: common option or custom format based on https://d3js.org/d3-format
        
  * **CHART** (**MAP** or **TABLE** in the future)
  * **LEGEND**
  * **ANOTATIONS**
     
## Implementation

The AGENTS.md should be used to force those guidelines to be follow.

The repo use small, iterative and sementic commits, with body or coauthor.

A Makefile is at the root of the project and allow to execute common opperations.

This Makefile should be used in priority by dev and CI.

The service is built in Typescript, VueJS is used for the interface and for reactivity, ESLINT is used for code linting, ESLINT Stylistic for style, Vite as build system, Vitest for tests.

It's very important to keep functions, components, composable and chart very small. 

Code quality and readability is central.

Components are created in a hierarchical directory structure (component/Display/DisplayUsername.vue) and should always be as small as possible.

They must always try to have a first level au abstraction, like a design system.

Both charts, components and DSL parser should have very maximum test coverage.

Test should be added next to the file they are testing.

We must use [BootstrapVueNext](https://bootstrap-vue-next.github.io/bootstrap-vue-next/) and maximize reusability.

Every style that can be provided by Bootstrap and Bootstrap's CSS variable should be used in priority.

Deisgn must be mobile first and available in both light and dark mode.

Vite should be configured to:
  * use auto resolve for Vue auto-imports
  * use https://github.com/unplugin/unplugin-icons to provide PhosphorIcons (auto-imported)
  * use https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs.html resolver
  * server on 0.0.0.0:5555

CI is done in Github Action and currently only support: lint, test and build (node 22).