(() => {
  window.addEventListener('DOMContentLoaded', async () => {
    // Constants
    // ratio 192:122
    const WIDTH = 975;
    const HEIGHT = 610;

    // Init
    const data = await fetchData('http://localhost:5555/api');
    console.log(data);
    renderData(data);

    // funciton declarations
    async function fetchData(url) {
      try {
        const response = await fetch(url);
        const { data } = await response.json();
        console.log(data);
        return data;
      } catch (err) {
        return {};
      }
    }

    function renderData(data) {
      //  Data

      const treemap = (data) =>
        d3.treemap().size([WIDTH, HEIGHT]).padding(1).round(true)(
          d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value)
        );

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const root = treemap(data);

      //Tooltip
      const tooltip = d3
        .select('article')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden');

      // Main SVG
      const svg = d3
        .select('article')
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

      const leaf = svg
        .selectAll('g')
        .data(root.leaves())
        .join('g')
        .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);

      leaf.append('title').text(
        (d) =>
          `${d
            .ancestors()
            .reverse()
            .map((d) => {
              return d.data.name;
            })}`
      );

      leaf
        .append('rect')
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('fill', (d) => {
          while (d.depth > 1) d = d.parent;
          return color(d.data.name);
        })
        .attr('fill-opacity', 0.6);

      leaf
        .append('clipPath')
        // .attr('id', (d) => (d.clipUid = DOM.uid('clip')).id)
        .append('use');
      // .attr('xlink:href', (d) => d.leafUid.href);

      leaf
        .append('text')
        // .attr('clip-path', (d) => d.clipUid)
        .selectAll('tspan')
        .data((d) => {
          console.log(d);
          return d.data.name.split(' ');
        })
        .join('tspan')
        .attr('x', 3)
        .attr(
          'y',
          (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
        )
        .attr('fill-opacity', (d, i, nodes) =>
          i === nodes.length - 1 ? 0.7 : null
        )
        .text((d) => {
          console.log(d);
          return d;
        })
        .attr('font-size', '.7em');

      // Tooltip animation
      svg;
      // .selectAll('.county')
      // .on('mouseover', function (d) {
      //   d3.select(this).order().raise().style('stroke', 'black');
      //   const [education] = educationData.filter(
      //     (county) => county.fips === d.id
      //   );
      //   const { x, y } = this.getBBox();
      //   tooltip
      //     .html(
      //       `${education.area_name}, ${education.state}: ${education.bachelorsOrHigher}%`
      //     )
      //     .attr('data-education', `${education.bachelorsOrHigher}`)
      //     .style('visibility', 'visible')
      //     .style('top', `${y}px`)
      //     .style('left', `${x + 20}px`);
      // })
      // .on('mouseout', function () {
      //   d3.select(this).order().lower().style('stroke', 'none');
      //   tooltip.style('visibility', 'hidden');
      // });
    }
  });
})();
