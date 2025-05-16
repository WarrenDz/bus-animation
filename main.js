// Set DEBUG to true to enable debug logging
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

// Define the map and bookmarks components
const mapElement = document.querySelector("arcgis-map");
const timeSlider = document.querySelector("arcgis-time-slider");
const resetButton = document.querySelector("#reset-button");

// Define a the mapping between slides and time ranges
const choreographyMapping = {
  "#slide1": {
    trackLayer: "",
    trackField: "",
    trackLabelField: "",
    trackLabelIds: [],
    trackRenderer: "basic",
    mapBookmark: "1 - Delayed",
    mapLayersOn: ["WMATA | Route 92 Bus Delayed", "WMATA | Metro Bus Stops", "WMATA | Metro Bus Route 92"],
    mapLayersOff: ["WMATA | Route 92 Buses", "WMATA | All Buses", "OTP | Route 92 20250224 - 20250304", "OTP | Buses All Routes 20250305"],
    mapTimeSyncedLayers: [],
    timeSliderStart: "2025-03-05T09:30:00-05:00",
    timeSliderEnd: "2025-03-05T11:00:00-05:00",
    timeSliderUnit: "hours",
    timeSliderStep: 3,
    timeSliderAutoplay: false
  },
  "#slide2": {
    trackLayer: "WMATA | Route 92 Buses",
    trackField: "TRIP_ID",
    trackLabelField: "VEHICLE_LABEL",
    trackLabelIds: ["6536"],
    trackRenderer: "otp",
    mapBookmark: "Route 92",
    mapLayersOn: ["WMATA | Route 92 Buses", "WMATA | Metro Bus Route 92"],
    mapLayersOff: ["WMATA | Route 92 Bus Delayed", "WMATA | All Buses", "OTP | Buses All Routes 20250305", "WMATA | Metro Bus Stops", "OTP | Route 92 20250224 - 20250304"],
    mapTimeSyncedLayers: [],
    timeSliderStart: "2025-03-05T09:00:00-05:00",
    timeSliderEnd: "2025-03-05T11:00:00-05:00",
    timeSliderUnit: "minutes",
    timeSliderStep: 1,
    timeSliderAutoplay: true
  },
  "#slide3": {
    trackLayer: "",
    trackField: "",
    trackLabelField: "",
    trackLabelIds: [],
    trackRenderer: "basic",
    mapBookmark: "Route 92",
    mapLayersOn: ["WMATA | Route 92 Bus Delayed", "WMATA | Metro Bus Stops", "OTP | Route 92 20250224 - 20250304"],
    mapLayersOff: ["WMATA | All Buses", "OTP | Buses All Routes 20250305", "WMATA | Metro Bus Route 92"],
    mapTimeSyncedLayers: [],
    timeSliderStart: "2025-03-05T08:00:00-05:00",
    timeSliderEnd: "2025-03-05T23:00:00-05:00",
    timeSliderUnit: "minutes",
    timeSliderStep: 3,
    timeSliderAutoplay: false
  },
  "#slide4": {
    trackLayer: "WMATA | All Buses",
    trackField: "TRIP_ID",
    trackLabelField: "",
    trackLabelIds: [],
    trackRenderer: "basic",
    mapBookmark: "3 - Washington DC",
    mapLayersOn: ["WMATA | All Buses"],
    mapLayersOff: ["WMATA | Route 92 Bus Delayed", "WMATA | Metro Bus Route 92", "WMATA | Metro Bus Stops", "OTP | Route 92 20250224 - 20250304", "OTP | Buses All Routes 20250305"], 
    mapTimeSyncedLayers: [],
    timeSliderStart: "2025-03-05T8:00:00-05:00",
    timeSliderEnd: "2025-03-05T23:00:00-05:00",
    timeSliderUnit: "minutes",
    timeSliderStep: 1,
    timeSliderAutoplay: true
  },
  "#slide5": {
    trackLayer: "",
    trackField: "",
    trackLabelField: "",
    trackLabelIds: [],
    trackRenderer: "basic",
    mapBookmark: "3 - Washington DC",
    mapLayersOn: ["OTP | Buses All Routes 20250305"],
    mapLayersOff: ["WMATA | All Buses", "WMATA | Route 92 Bus Delayed", "WMATA | Metro Bus Route 92", "WMATA | Metro Bus Stops", "OTP | Route 92 20250224 - 20250304"], 
    mapTimeSyncedLayers: [],
    timeSliderStart: "2025-03-05T8:00:00-05:00",
    timeSliderEnd: "2025-03-05T23:00:00-05:00",
    timeSliderUnit: "minutes",
    timeSliderStep: 1,
    timeSliderAutoplay: false
  }
}

    // Create a definition expression to filter the track layer by time since timeslider
    const dateDiffExpression = `
    if(!HasValue($view, [ "timeProperties", "currentEnd" ])) {
      return null;
    }
    var e = $view.timeProperties.currentEnd;
    var t = $feature.VEHICLE_DATETIME;
    var d = DateDiff(e, t, 'minutes');
    return d;
  `;

  // Basic track renderer
const basicTrack = {
  enabled: true,
  timeField: "startTimeField",
  maxDisplayObservationsPerTrack: 6,
  latestObservations: {
    visible: true,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: "#E4F3FF",
        size: 3,
        outline: {
          color: "black",
          width: 0.5
        }
      },
      visualVariables: [{
          type: "opacity",
          valueExpression: dateDiffExpression,
          legendOptions: {
            showLegend: false
          },
          stops: [
            { value: 7, opacity: 1 },
            { value: 14, opacity: 0 }
          ]
        }]
    }
  },
  previousObservations: {
    enabled: false,
    visible: false,
    labelsVisible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: "#56B2FF",
        size: 1.5
      }
    }
  },
  trackLines: {
    visible: true,
    enabled: true,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: "#1A78C6",
        width: 0.5
      },
      visualVariables: [{
          type: "opacity",
          valueExpression: dateDiffExpression,
          legendOptions: {
            showLegend: false
          },
          stops: [
            { value: 7, opacity: 1 },
            { value: 14, opacity: 0 }
          ]
        }]
    }
  }
};

// OTP track renderer
const otpTrack = {
  enabled: true,
  timeField: "startTimeField",
  maxDisplayObservationsPerTrack: 6,
  latestObservations: {
    visible: true,
    labelsVisible: true,
    labelingInfo: [
                {
                  symbol: {
                    type: "text",
                    color: "white",
                    haloColor: "black",
                    haloSize: 1.5,
                    font: {
                      family: "Noto Sans",
                      size: 8,
                      weight: "bold"
                    }
                  },
                  labelPlacement: "above-right",
                  labelExpressionInfo: {
                    expression: "$feature.VEHICLE_LABEL"
                  },
                  where: `VEHICLE_ID = 6536 AND TRIP_ID = 29472020`
                }
              ],
    renderer: {
      type: "unique-value",
      field: "NEW_OTP_TEXT",
      defaultSymbol: {
        type: "simple-marker",
        style: "circle",
        color: "#E4F3FF",
        size: 3,
        outline: {
          color: "black",
          width: 0.25
        }
      },
      uniqueValueInfos: [
        {
          value: "Early",
          label: "Early",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#2eb245",
            size: 5,
            outline: {
              color: "black",
              width: 0.25
            }
          }
        },
        {
          value: "On-Time",
          label: "On-Time",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#1a78c6",
            size: 5,
            outline: {
              color: "black",
              width: 0.25
            }
          }
        },
        {
          value: "Late",
          label: "Late",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#fccb16",
            size: 5,
            outline: {
              color: "black",
              width: 0.25
            }
          }
        }
      ],
      visualVariables: [{
          type: "opacity",
          valueExpression: dateDiffExpression,
          legendOptions: {
            showLegend: false
          },
          stops: [
            { value: 7, opacity: 1 },
            { value: 14, opacity: 0 }
          ]
        }]
    }
  },
  previousObservations: {
    enabled: true,
    visible: true,
    labelsVisible: false,
    renderer: {
      type: "unique-value",
      field: "NEW_OTP_TEXT",
      defaultSymbol: {
        type: "simple-marker",
        style: "circle",
        color: "#E4F3FF",
        size: 2,
        outline: {
          color: "white",
          width: 0
        }
      },
      uniqueValueInfos: [
        {
          value: "Early",
          label: "Early",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#2eb245",
            size: 2,
            outline: {
              color: "white",
              width: 0
            }
          }
        },
        {
          value: "On-Time",
          label: "On-Time",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#1a78c6",
            size: 2,
            outline: {
              color: "white",
              width: 0
            }
          }
        },
        {
          value: "Late",
          label: "Late",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "#fccb16",
            size: 2,
            outline: {
              color: "white",
              width: 0
            }
          }
        }
      ],
      visualVariables: [{
          type: "opacity",
          valueExpression: dateDiffExpression,
          legendOptions: {
            showLegend: false
          },
          stops: [
            { value: 7, opacity: 1 },
            { value: 14, opacity: 0 }
          ]
        }]
    }
  },
  trackLines: {
    visible: true,
    enabled: true,
    renderer: {
      type: "unique-value",
      field: "NEW_OTP_TEXT",
      defaultSymbol: {
        type: "simple-line",
        color: "#1A78C6",
        width: 0.5
      },
      uniqueValueInfos: [
        {
          value: "Early",
          label: "Early",
          symbol: {
            type: "simple-line",
            color: "#2eb245",
            width: 0.5
          }
        },
        {
          value: "On-Time",
          label: "On-Time",
          symbol: {
            type: "simple-line",
            color: "#1a78c6",
            width: 0.5
          }
        },
        {
          value: "Late",
          label: "Late",
          symbol: {
            type: "simple-line",
            color: "#fccb16",
            width: 0.5
          }
        }
      ],
      visualVariables: [{
          type: "opacity",
          valueExpression: dateDiffExpression,
          legendOptions: {
            showLegend: false
          },
          stops: [
            { value: 7, opacity: 1 },
            { value: 14, opacity: 0 }
          ]
        }]
    }
  }
};

// Wait for a change in readiness from the map element
mapElement.addEventListener("arcgisViewReadyChange", (event) => {
  // When the map is ready...
  if (event.target.ready) {
    // Assign a previous hash variable to store the last hash
    let previousHash = null;
    let hash = window.location.hash || "#slide1"; // if no has is present use #slide1

    // Access the MapView from the arcgis-map component
    const view = mapElement.view;

    // Disable map navigation
    view.on("mouse-wheel", (event) => {
      event.stopPropagation();
    });
    // view.on("drag", (event) => {
    //   event.stopPropagation();
    // });

    // Access the WebMap instance from the view
    const map = view.map;

    // MAIN CHOREOGRAPHY FUNCTION
    async function updateMapChoreography() {
      // Get the current hash of the browser window
      // Use this to pull map choreography info
      let hash = window.location.hash || "#slide1"; // if no has is present use #slide1
      log("Current hash:", hash);

      // Access the layers within the map
      const layers = map.layers;

      // Configure the track layer
      // Find the name of the desired track layer in the map layers
      let trackLayer = layers.find((layer) => layer.title === choreographyMapping[hash].trackLayer);

      // If found configure the track renderer
      async function applyTrackRender(trackLayerName, trackLayerField, trackLabelField, trackLabelIds, trackRenderer) {
        if (trackLayer) {
          // these are an attempt to do a hard reset on the renderer when we switch hashes
          map.remove(trackLayer);
          trackLayer = trackLayer.clone();
          map.add(trackLayer);
          //
          log("Found track layer named:", trackLayer.title);
          await trackLayer.when(); // Wait for the layer to load
          const trackStartField = trackLayer.timeInfo.startField;

          // Configure the track layer renderer
          trackLayer.visible = true; // Make the layer visible
          trackLayer.timeInfo = {
            startField: trackStartField,
            trackIdField: trackLayerField,
            interval: {
              unit: choreographyMapping[hash].timeSliderUnit,
              value: choreographyMapping[hash].timeSliderStep
            }
          };
          trackLayer.effect = "bloom(3, 0.5px, 10%)" // Apply a bloom effect to the track layer
          // Set the renderer based on the trackRenderer argument basic | otp
          if (trackRenderer === "otp") {
            trackLayer.trackInfo = otpTrack;
          } else if (trackRenderer === "basic") {
            trackLayer.trackInfo = basicTrack;
          } else {
            trackLayer.trackInfo = basicTrack;
          }
        }
      }
      // Function to update the map bookmark
      function updateMapBookmark(bookmarkName) {
        if (choreographyMapping[hash]) {
          // Set the initial map extent by the bookmarkStart
          const bookmarks = view.map.bookmarks; // Get the bookmarks array from the WebMap
          const targetBookmark = bookmarks.find(b => b.name === bookmarkName);
          // Find the bookmark by name
          // If the bookmark exists, navigate to it
          if (targetBookmark) {
            const bookmarkTarget = targetBookmark.viewpoint;
            bookmarkTarget.scale = bookmarkTarget.scale * 1.1; // Adjust the scale to zoom out a bit
            mapElement.goTo(bookmarkTarget, { duration: 6000 });  // Navigates to the bookmark view
          } else {
            console.error(`Bookmark "${bookmarkName}" not found!`);
          } 
        }
      }
      // Function to toggle the visibility of a list of layer names
      function setLayerVisibility(layers, layerNames, visibility) {
        if (layerNames && layerNames.length > 0) {
          layers.forEach((layer) => {
            if (layerNames.includes(layer.title)) {
              layer.visible = visibility; // Set visibility based on the argument
              log(
                visibility
                  ? "(+) " + layer.title + " is now visible."
                  : "(-) " + layer.title + " is now hidden."
              );
            }
          });
        }
      }
      // This function manages the visibility of time-synced layers
      // It only turns these layers on in the map if the current time is greater than the visibleFrom date
      function manageTimeSyncedLayers(currentTimeSynced, previousTimeSynced, currentTime, layers) {
        // Create a map of layers for efficient lookups
        let layerMap = new Map(layers.map((layer) => [layer.title, layer]));
      
        // Function to set the visibility of layers based on time-synced data
        function updateLayerVisibility(timeSynced) {
          if (timeSynced && timeSynced.length > 0) {
            timeSynced.forEach((sync) => {
              const layer = layerMap.get(sync.layer);
              if (layer) {
                const visibleFrom = new Date(sync.visibleFrom);
                layer.visible = currentTime >= visibleFrom;
                log(
                  layer.visible
                    ? "(+) " + layer.title + " is now visible (current time-synced layer)."
                    : "(-) " + layer.title + " remains hidden (current time-synced layer)."
                );
              }
            });
          }
        }
      
      // Turn off previous layers
      setLayerVisibility(layerMap, previousTimeSynced.map(sync => sync.layer), false);
      
        // Update visibility for current layers
        updateLayerVisibility(currentTimeSynced);
      }

      // Function to define and start the timeSlider component of the animation
      function updateTimeSlider(timeStart, timeEnd, timeUnit, timeStep, timeSynced, layers, previousTimeSynced, autoplay) {
        // Configure the time sliders full extent with the start and end time from choreographyMapping
        const startFrame = new Date(timeStart);
        const endFrame = new Date(timeEnd);
        timeSlider.fullTimeExtent = {start: startFrame, end: endFrame};
        timeSlider.timeExtent = {start: null, end: startFrame}
        // Set the timeSlider stops
        timeSlider.stops = {
          interval: {
            unit: timeUnit,
            value: timeStep
          }
        };
        // Listen for time extent changes
        if (timeSynced && timeSynced.length > 0) {
          timeSlider.addEventListener("arcgisPropertyChange", async (event) => {
            let currentTime = timeSlider.timeExtent.end;
            log("Time slider changed to:", currentTime);

            // Calculate the time range for filtering (current time minus 15 minutes)
            const filterTime = new Date(currentTime);
            filterTime.setMinutes(filterTime.getMinutes() - 15); // TODO: Check back on this after adding a timezone to the data

            // Update the definitionExpression on the trackLayer
            if (trackLayer) {
                trackLayer.definitionExpression = `VEHICLE_DATETIME >= '${filterTime.toISOString()}' AND VEHICLE_DATETIME <= '${currentTime.toISOString()}'`;
                log("Updated definitionExpression:", trackLayer.definitionExpression);
            }

            // Update time-synced layers
            manageTimeSyncedLayers(timeSynced, previousTimeSynced, currentTime, layers);
          });
        }
        
        // Start a TimeSlider animation if not already playing
        if (autoplay && timeSlider.state === "ready") {
          log("Time slider is set to: ", timeSlider.timeZone)
          timeSlider.play();
        } else {
          timeSlider.stop();
        }
      }
      // Call functions
      try {
        await applyTrackRender(
          choreographyMapping[hash].trackLayer,
          choreographyMapping[hash].trackField,
          choreographyMapping[hash].trackLabelField,
          choreographyMapping[hash].trackLabelIds,
          choreographyMapping[hash].trackRenderer
        ); // Wait for the track renderer to be applied

        updateMapBookmark(choreographyMapping[hash].mapBookmark);

        updateTimeSlider(
          choreographyMapping[hash].timeSliderStart,
          choreographyMapping[hash].timeSliderEnd,
          choreographyMapping[hash].timeSliderUnit,
          choreographyMapping[hash].timeSliderStep,
          choreographyMapping[hash].mapTimeSyncedLayers,
          layers,
          choreographyMapping[previousHash]?.mapTimeSyncedLayers || [],
          choreographyMapping[hash].timeSliderAutoplay
        );
        // Turn off layer visibility
        if (choreographyMapping[hash].mapLayersOn.length > 0) {
          setLayerVisibility(layers, choreographyMapping[hash].mapLayersOn, true);
        }
        // Turn on layer visibility
        if (choreographyMapping[hash].mapLayersOff.length > 0) {
          setLayerVisibility(layers, choreographyMapping[hash].mapLayersOff, false);
        }
        // Update the previous hash
        previousHash = hash;

        log("Map choreography updated successfully.");
      } catch (error) {
        console.error("Error updating map choreography:", error);
      }
    }

    // Add reset animation button
    resetButton.addEventListener("click", () => {
      const config = choreographyMapping[hash];
      if (config) {
        // Reset the time slider to its initial state
        timeSlider.timeExtent = {
          start: null,
          end: new Date(config.timeSliderStart)
        };
  
        // Replay the animation
        if (timeSlider.state === "ready") {
          timeSlider.play();
        }
  
        log("Animation reset and replayed.");
      } else {
        console.error("No configuration found for the current hash.");
      }
    });
    // Enable or disable the reset button based on the autoplay argument
    function updateResetButtonState() {
      const config = choreographyMapping[hash];
      if (config && config.timeSliderAutoplay) {
        resetButton.disabled = false; // Enable the button
        timeSlider.stop();
      } else {
        resetButton.disabled = true; // Disable the button
      }
    }

    // Call the function to set the initial state of the reset button
    updateResetButtonState();

    // Call the updateMapChoreography function to set the initial state
    updateMapChoreography()
    // Listen for hash changes and update the choreography
    window.addEventListener("hashchange", async () => {
      await updateMapChoreography();
      updateResetButtonState();
    });
  }
});