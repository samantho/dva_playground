import d3 from "lib";

var artist_names = [];
var artist_uris = [];

// Form listener for artist selection
var form = document.getElementById("myForm");
// Hide display items before selection
form.style.display = "none";
document.getElementById("song_data").style.display = "none";

// const math = require('mathjs');
const math = window.math;

function handleForm(event) {
  event.preventDefault();
}
form.addEventListener("submit", handleForm);

// Upload possible artist names
d3.csv("artists.csv", (d) => {
  artist_names.push(d.artist_name);
  artist_uris.push(d.artist_uri);
}).then((d) => {
  // then give option to input once names are loaded
  form.style.display = "block";
});

let artist_name = "Drake";
var top1;
var top2;
var top3;
var chart;

/**
         * HOW TO GET AN ACCESS TOKEN: 
         * - Sign up for a Spotify Developer Account (free)
         * - Create an app in your Dashboard (https://developer.spotify.com/documentation/web-api/tutorials/getting-started#create-an-app)
         * - Get the Client id and Client secret for the App
         * - Run this curl request to generate a one-hour access token: 
         *      curl -X POST "https://accounts.spotify.com/api/token" \
                    -H "Content-Type: application/x-www-form-urlencoded" \
                    -d "grant_type=client_credentials&client_id=your-client-id&client_secret=your-client-secret"
         * - Replace the accessToken below with access token from request
        **/

const accessToken =
  "BQAG4VPWwfOS0hk0ZTtaQyj2FOSNUR8Zy-lcu39M-gHr8j-JWCyQWpB1Rf9HKUFCzjCpKp4uPN8Uf96TaoQRbFpg427UTSxZ0Itde213WIzgAzE36t1x";

// This function is triggered once the artist selection form was submitted
async function validateForm() {
  let x = document.getElementById("artistSelect").value;
  document.getElementById("myForm");
  var error = document.getElementById("error");
  if (artist_names.includes(x)) {
    // If artist is found, print name in green
    error.innerHTML =
      "<span style='color: green;'>" + "Artist Chosen: " + x + "</span>";
    form.reset();
    d3.select("#track-name").selectAll("option").remove();
    document.getElementById("song_data").style.display = "none";

    // Then generate the graph
    $("#artist_graph").empty();
    d3.select("#first-song").html("");
    d3.select("#second-song").html("");
    d3.select("#third-song").html("");
    createGraph(x);
  } else {
    // If artist is not found, print red error
    error.innerHTML = "<span style='color: red;'>" + "Artist not found</span>";
    form.reset();
  }
}

// This function creates the artist graph
function createGraph(art_name) {
  $("#artist_graph").empty();
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  var artist_name = art_name;
  var links;
  var data;
  var tracks;

  fetch(
    "https://rmanaqd7j4.execute-api.us-east-1.amazonaws.com/default/spot?artist=" +
      artist_name,
    requestOptions
  )
    .then((response) => response.text())
    .then(function (data) {
      data = JSON.parse(data);
      data = data["body"];

      links = data["edges"];
      tracks = data["tracks"];
      top1 = data["nodes"][1]["id"];
      top2 = data["nodes"][2]["id"];
      top3 = data["nodes"][3]["id"];
      // console.log(data['nodes'][0]['id'], top1, top2, top3)
    })
    .then(function (f) {
      var nodes = {};

      links.forEach(function (link) {
        link.from =
          nodes[link.from] || (nodes[link.from] = { name: link.from });
        link.to = nodes[link.to] || (nodes[link.to] = { name: link.to });
      });

      for (const [key, value] of Object.entries(links)) {
        links[key]["source"] = { name: links[key]["from"] };
        links[key]["target"] = { name: links[key]["to"] };
        links[key]["value"] = links[key]["freq"];
      }

      console.log(nodes);
      console.log(links);
      // console.log(tracks)
      var width = 800;
      var height = 800;

      var force = d3
        .forceSimulation()
        .nodes(d3.values(nodes))
        .force("link", d3.forceLink(links).distance(100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-250))
        .alphaTarget(1)
        .on("tick", tick);

      var svg = d3.select("#artist_graph");

      var path = svg
        .append("g")
        .attr("stroke", "#FF0000")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("class", function (d) {
          return "link " + d.type;
        })
        .style("stroke", function (d) {
          // if (d.freq >= 1000) {
          // return "green";
          // } else {
          // return "gray"
          // }
          return "gray";
        })
        .style("stroke-width", 2)
        .on("mouseover", function (d) {
          d3.select(this).style("stroke-width", "5");
          var tooltip = d3.select("#tooltip");
          tooltip
            .style("visibility", "visible")
            .html(
              "source: " +
                d.from.name +
                "<br>" +
                "target: " +
                d.to.name +
                "<br>" +
                "freq: " +
                d.freq +
                "<br>"
            )
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", d3.event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).style("stroke-width", "2");
          var tooltip = d3.select("#tooltip");
          tooltip.style("visibility", "hidden");
        });

      var node = svg
        .selectAll(".node")
        .data(force.nodes())
        .enter()
        .append("g")
        .attr("class", "node")
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
        .on("mouseover", function (d) {
          d3.select(this).style("stroke-width", "5");
          var tooltip = d3.select("#tooltip");
          tooltip
            .style("visibility", "visible")
            .html(function (e) {
              if (d.index == 0) {
                return (
                  "<b>" +
                  d.name +
                  "</b><br>" +
                  "Top Recommendation: " +
                  top1 +
                  "<br>" +
                  "Second Rec: " +
                  top2 +
                  "<br>" +
                  "Third Rec: " +
                  top3 +
                  "<br>"
                );
              } else if (d.index <= 10) {
                return "Recommendation " + d.index + ": " + d.name;
              }
              return d.name;
            })
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", d3.event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).style("stroke-width", "2");
          var tooltip = d3.select("#tooltip");
          tooltip.style("visibility", "hidden");
        });

      var tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("visibility", "hidden");

      function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        d.fixed = true;
      }

      function dragended(d) {
        if (!d3.event.active) force.alphaTarget(0);
        console.log(d.fixed);
        if (d.fixed == true) {
          d.fx = d.x;
          d.fy = d.y;
        } else {
          d.fx = null;
          d.fy = null;
        }
      }

      // var colors = ['#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b', '#00441b', '#00441b']
      // var colors = ['#f0b501', '#f3c12a', '#f7cc42', '#fbd756', '#ffe26a']
      // var colors = ['#00441b','#238b45', '#74c476','#e5f5e0']

      node
        .append("circle")
        .attr("id", function (d) {
          return d.name.replace(/\s+/g, "").toLowerCase();
        })
        .attr("r", function (d) {
          if (d.index == 0) {
            return 30;
          } else if (d.index <= 10) {
            return 15;
          } else {
            return 8;
          }
        })
        .style("fill", function (d) {
          if (d.index == 0) {
            return "green";
            // return "#f3c12a"
          } else if (d.index <= 10) {
            if (d.index <= 3)
              // return colors[d.index - 1]
              return "#f3c12a";
            // return colors[3]
            else return "#ffffcc";
            // return "lightblue"
          } else {
            return "gray";
          }
        })
        .each(function () {
          d3.select(this).on("click", function (d) {
            d3.select(this).fixed = false;
            d.fixed = false;
          });
        });

      node
        .append("text")
        .style("font-weight", 700)
        .text(function (d) {
          return d.name;
        })
        .attr("x", 0)
        .attr("y", 0);

      function tick() {
        path.attr("d", function (d) {
          var dx = d.to.x - d.from.x,
            dy = d.to.y - d.from.y,
            dr = Math.sqrt(dx * dx + dy * dy);
          return (
            "M" +
            d.from.x +
            "," +
            d.from.y +
            "A" +
            dr +
            "," +
            dr +
            " 0 0,1 " +
            d.to.x +
            "," +
            d.to.y
          );
        });

        node.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      // This function waits to be called until the graph is generated
    })
    .then(function () {
      // console.log('I am after graph generation');
      console.log(tracks);
      drop_list = tracks.filter((track) => track.artist_name == artist_name);
      console.log(drop_list);
      dropdown = d3.select("#track-name");

      dropdown
        .selectAll("option")
        .data(drop_list)
        .enter()
        .append("option")
        .text((d) => d.track_name)
        .attr("value", (d) => d.track_uri);

      // This function waits to be called until the dropdown is populated
    })
    .then(function () {
      document.getElementById("song_data").style.display = "block";
      var song_form = d3.select("#track-list-form");
      var song_uri;
      var first_song;
      var first_pass;

      song_form.on("submit", function () {
        first_pass = true;
        d3.select("#first-song").html("");
        d3.select("#second-song").html("");
        d3.select("#third-song").html("");
        d3.event.preventDefault();
        song_uri = d3.select("#track-name").property("value");
        console.log(song_uri);

        // var other_songs = tracks.filter(track => track.artist_name != artist_name);
        // var trackList = [...new Set(other_songs.map(song => ({ "song": song.track_uri, "artist": song.artist_name })))];
        // var trackUris = [...new Set(other_songs.map(song => song.track_uri))];
        trackUris = [
          {
            song: song_uri.replace("spotify:track:", ""),
            artist: artist_name,
            track: d3.select("#track-name").property("options")[
              d3.select("#track-name").property("selectedIndex")
            ].text,
          },
        ];
        get_song_data(trackUris);
      });

      function get_song_data(trackUris) {
        // var other_songs = tracks.filter(track => track.artist_name != artist_name);
        // var trackUris = [...new Set(other_songs.map(song => song.track_uri))];
        // trackUris.unshift(song_uri)
        // trackUris = trackUris.map(uri => uri.replace('spotify:track:', ''));

        const fetchTrackData = async (trackUri) => {
          const response = await fetch(
            `https://api.spotify.com/v1/audio-features/${trackUri.song}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          var data = await response.json();
          if (first_pass) {
            first_song = Object.keys(data)
              .filter((key) => typeof data[key] === "number")
              .map((key) => data[key]);
            data["similarity"] = 0;
            data["artist"] = trackUri.artist;
            data["track"] = trackUri.track;
          } else {
            song_values = Object.keys(data)
              .filter((key) => typeof data[key] === "number")
              .map((key) => data[key]);
            if (math.norm(song_values) > 0) {
              // IF SIMILARITY SWITCHED, MUST SWITCH SCORING
              // cosine similarity
              // data['similarity'] = math.dot(first_song, song_values) / (math.norm(first_song) * math.norm(song_values));//first_song.id;
              // euclidean distance
              data["similarity"] = math.sqrt(
                math.sum(math.square(math.subtract(first_song, song_values)))
              );
              // euclidean similarity
              // data['similarity'] = 1 / (1 + (math.sqrt(math.sum(math.square(math.subtract(first_song, song_values))))));
              // data['similarity'] = 1 / (math.exp(math.sqrt(math.sum(math.square(math.subtract(first_song, song_values))))));
              data["artist"] = trackUri.artist;
              data["track"] = trackUri.track;
            }
          }
          // console.log(data)
          return data;
        };

        const fetchAllTracks = async () => {
          const allPromises = trackUris.map((uri) => fetchTrackData(uri));
          const allData = await Promise.all(allPromises);
          return allData;
        };

        fetchAllTracks().then(function (data) {
          if (first_pass) {
            var other_songs = tracks.filter(
              (track) => track.artist_name != artist_name
            );
            // var trackUris = [...new Set(other_songs.map(song => song.track_uri))];
            const trackUris = other_songs.map((d) => {
              return {
                song: d.track_uri.replace("spotify:track:", ""),
                artist: d.artist_name,
                track: d.track_name,
              };
            });
            first_pass = false;
            get_song_data(trackUris);
          } else {
            // cosine or euclidean similarity
            // data = data.sort((a, b) => b.similarity - a.similarity);
            // euclidean
            data = data.sort((a, b) => a.similarity - b.similarity);
            // At this point, data is collected for every song to see how similar it is to the chosen song
            // This dataframe is sorted by similarity and must be subset to the top three artists
            // console.log(data);
            console.log(data);

            // similarity score is 1 - (euclidean / max(euclidean))

            d3.select("#first-song").html(
              "Top Recommended Artist is " +
                top1 +
                ". We think you will like their song " +
                data.filter((track) => track.artist == top1)[0]["track"] +
                ". Similarity score: " +
                (1 -
                  data.filter((track) => track.artist == top1)[0][
                    "similarity"
                  ] /
                    data.filter((track) => track.artist == top1).at(-1)[
                      "similarity"
                    ])
            );
            d3.select("#second-song").html(
              "Second Recommended Artist is " +
                top2 +
                ". We think you will like their song " +
                data.filter((track) => track.artist == top2)[0]["track"] +
                ". Similarity score: " +
                (1 -
                  data.filter((track) => track.artist == top2)[0][
                    "similarity"
                  ] /
                    data.filter((track) => track.artist == top2).at(-1)[
                      "similarity"
                    ])
            );
            d3.select("#third-song").html(
              "Third Recommended Artist is " +
                top3 +
                ". We think you will like their song " +
                data.filter((track) => track.artist == top3)[0]["track"] +
                ". Similarity score: " +
                (1 -
                  data.filter((track) => track.artist == top3)[0][
                    "similarity"
                  ] /
                    data.filter((track) => track.artist == top3).at(-1)[
                      "similarity"
                    ])
            );
          }
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}
