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
            .map((d) => d.data.name)}`
      );

      leaf
        .append('rect')
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('fill', (d) => {
          while (d.depth > 1) d = d.parent;
          return color(d.data.name);
        })
        .attr('fill', (d) => color(d.data.name))
        .attr('fill-opacity', 0.6);

      leaf.append('text').selectAll('tspan').data(data);
      // .join('tspan')
      // .attr('x', (d, i, nodes) => {
      //   let w = d.parent.x1 - d.parent.x0 - 5;
      //   let n = Math.floor(w / emojiSize);
      //   return 3 + (i % n) * emojiSize;
      // })
      // .attr('y', (d, i, nodes) => {
      //   let w = d.parent.x1 - d.parent.x0 - 5;
      //   let n = Math.floor(w / emojiSize);
      //   return 25 + Math.floor(i / n) * emojiSize;
      // })
      // .style('font-size', `${emojiSize}px`)
      // .text((d) => d.name);

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
