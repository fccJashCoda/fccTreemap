(() => {
  window.addEventListener('DOMContentLoaded', async () => {
    // Constants
    // ratio 192:122
    const WIDTH = 1344;
    const HEIGHT = 854;

    // Init
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
        // +(Math.round(n / 1000000 + 'e2') + 'e-2')
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
            .map((d) => d.data.name)}`
      );

      leaf
        .append('rect')
        .attr('class', 'tile')
        .attr('id', (d) => (d.leafUid = `rect${d.value}`))
        .attr('width', (d) => {
          console.log(d);
          return d.x1 - d.x0;
        })
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
        .on('mouseover', function (d) {
          d3.select(this).order().raise().style('stroke', 'black');
          console.log(d);
          tooltip
            .html(
              `
              Name: ${d.data.name}<br>
              Category:${d.data.category}<br>
              Value: ${format(d.data.value)}`
            )
            .attr('data-value', `${d.data.value}`)
            .style('visibility', 'visible')
            .style('top', `${d.y0}px`)
            .style('left', `${d.x0 + 20}px`);
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
