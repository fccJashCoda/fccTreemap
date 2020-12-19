(() => {
  window.addEventListener('DOMContentLoaded', async () => {
    // Constants
    // ratio 192:122
    const WIDTH = 1536;
    const HEIGHT = 976;

    // Init
    const data = await fetchData(
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
    );
    renderData(data);

    // funciton declarations
    async function fetchData(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (err) {
        return {};
      }
    }

    function renderData(data) {
      //  Data
      const format = (n) => {
        return `$${n}m`;
      };

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

      // Tooltip animation
      svg
        .selectAll('rect')
        .on('mousemove', function (d) {
          d3.select(this).order().raise().style('stroke', 'black');
          const coordinates = d3.mouse(this);

          const coordX = coordinates[0];
          const coordY = coordinates[1];

          tooltip
            .html(
              `
              Name: ${d.data.name}<br>
              Category:${d.data.category}<br>
              Value: ${format(d.data.value)}`
            )
            .attr('data-value', `${d.data.value}`)
            .style('visibility', 'visible')
            .style('top', `${d.y0 + coordY - 15}px`)
            .style('left', `${d.x0 + coordX + 20}px`);
        })
        .on('mouseout', function () {
          d3.select(this).order().lower().style('stroke', 'none');
          tooltip.style('visibility', 'hidden');
        });

      const size = 20;
      const legend = d3.select('#legend');

      legend
        .selectAll('rect')
        .data(data.children)
        .enter()
        .append('div')
        .append('svg')
        .attr('width', 120)
        .attr('height', 20)
        .append('g')
        .append('rect')
        .attr('class', 'legend-item')
        .attr('fill', (d) => color(d.name))
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', size)
        .attr('height', size);

      legend
        .selectAll('g')
        .append('text')
        .text((d) => (d.name === '2600' ? 'ATARI2600' : d.name))
        .attr('x', size * 1.2)
        .attr('y', 15);
    }
  });
})();
