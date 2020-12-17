(() => {
  window.addEventListener('DOMContentLoaded', async () => {
    // Constants
    // ratio 192:122
    const WIDTH = 1536;
    const HEIGHT = 976;

    // Init
    // const data = await fetchData('http://localhost:5555/api/');
    const data = await fetchData('http://localhost:5555/api/videogames');
    renderData(data);
    console.log(data);

    // funciton declarations
    async function fetchData(url) {
      try {
        const response = await fetch(url);
        const { data } = await response.json();
        return data;
      } catch (err) {
        return {};
      }
    }

    function renderData(data) {
      //  Data
      const format = (n) => {
        return `$${n}m`;
        // return `$${+(Math.round(n / 1000000 + 'e2') + 'e-2')}m`;
      };

      const treemap = (data) =>
        d3.treemap().size([WIDTH, HEIGHT]).padding(1).round(true)(
          d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value)
        );

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      console.log(color('action'));

      const root = treemap(data);

      //Tooltip
      const tooltip = d3
        .select('article')
        // .append('svg')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden');

      // Main SVG
      const svg = d3
        .select('article')
        .append('svg')
        .attr('id', 'treemap')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

      const leaf = svg
        .selectAll('g')
        .data(root.leaves())
        .join('g')
        .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);

      leaf
        .append('rect')
        .attr('class', 'tile')
        .attr('id', (d) => (d.leafUid = `rect${d.value}`))
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('fill', (d) => {
          while (d.depth > 1) d = d.parent;
          return color(d.data.name);
        })
        .attr('fill-opacity', 0.6)
        .attr('data-name', (d) => d.data.name)
        .attr('data-category', (d) => d.data.category)
        .attr('data-value', (d) => d.data.value);

      leaf
        .append('clipPath')
        .attr('id', (d) => (d.clipUid = `clip${d.value}`))
        .append('use')
        .attr('xlink:href', (d) => `#${d.leafUid}`);

      leaf
        .append('text')
        .attr('clip-path', (d) => `url(#${d.clipUid})`)
        .selectAll('tspan')
        .data((d) => d.data.name.trim().split(' ').concat(format(d.value)))
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
          return d;
        })
        .attr('font-size', '.7em');

      // //Tooltip
      // const tooltip = d3
      //   .select('#treemap')
      //   .append('svg')
      //   .attr('id', 'tooltip')
      //   .style('visibility', 'hidden');

      // Tooltip animation
      svg
        .selectAll('rect')
        .on('mousemove', function (d) {
          d3.select(this).order().raise().style('stroke', 'black');
          tooltip
            .html(
              `
              Name: ${d.data.name}<br>
              Category:${d.data.category}<br>
              Value: ${format(d.data.value)}`
            )
            .attr('data-value', `${d.data.value}`)
            .style('visibility', 'visible')
            // .attr('x', `${d3.event.pageY}`)
            // .attr('y', `${d3.event.pageX}`);
            // .style('top', `${d3.event.pageY - (d.y1 - d.y0)}px`)
            // .style('left', `${d3.event.pageX - (d.x1 - d.x0)}px`);
            .style('top', `${d3.event.pageY - HEIGHT / 4 + 30}px`)
            .style('left', `${d3.event.pageX - WIDTH / 4 - 100}px`);
        })
        .on('mouseout', function () {
          d3.select(this).order().lower().style('stroke', 'none');
          tooltip.style('visibility', 'hidden');
        });

      const legend = d3.select('article').append('legend').attr('id', 'legend');

      legend
        .selectAll('rect')
        .data(data.children)
        .enter()
        .append('g')
        .append('rect')
        .attr('class', 'legend-item')
        .attr('fill', (d) => color(d.name))
        .attr('width', '10px')
        .attr('height', '10px');

      legend
        .selectAll('g')
        .append('text')
        .text((d) => d.name);
    }
  });
})();
