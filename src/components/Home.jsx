import React, { useCallback } from "react";
import axios from "axios";

import styles from "../css/home.css";

class Home extends React.Component {
  constructor() {
    super();
    this.computeDistance = this.computeDistance.bind(this);
    this.state = {
      routes: [
        {
          index: 1,
          direction: "Away",
          stop_name: "Home",
          destination: "Up Bathurst",
          route: 511,
          api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=511&s=12898",
          stop: "12898",
        },
        {
          index: 2,
          direction: "Away",
          stop_name: "Home",
          destination: "To Union",
          route: 509,
          api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=509&s=12898",
          stop: "12898",
        },
        // {
        //   index: 3,
        //   direction: "Away",
        //   stop_name: "Home",
        //   destination: "To Ex",
        //   route: 511,
        //   api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=511&s=12891",
        //   stop: "12891",
        // },
        // {
        //   index: 4,
        //   direction: "Away",
        //   stop_name: "Home",
        //   destination: "To Ex",
        //   route: 509,
        //   api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=509&s=12891",
        //   stop: "12891",
        // },

        {
          index: 5,
          direction: "To Home",
          stop_name: "Bathurst",
          destination: "Home",
          route: 509,
          api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=509&s=4439",
          stop: "4439",
        },

        {
          index: 6,
          direction: "To Home",
          stop_name: "Bathurst",
          destination: "Home",
          route: 511,
          api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=511&s=4439",
          stop: "4439",
        },
        {
          index: 7,
          direction: "To Home",
          stop_name: "Queen",
          destination: "Home",
          route: 511,
          api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=511&s=1068",
          stop: "1068",
        },
        {
          index: 8,
          direction: "To Home",
          stop_name: "King",
          destination: "Home",
          route: 511,
          api: "https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=511&s=5469",
          stop: "5469",
        },
      ],
      statusData: null,
      lon: null,
      lat: null,
    };
  }
  onlyUnique(value, index, array) {
    return array.indexOf(value.route) === index;
  }
  componentDidMount() {
  
    this.getData();
  }

  getPosition() {
    // Simple wrapper
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
    });
}

  getData(e) {
    let routes = this.state.routes;
    let statusDataArray = [];

    routes.forEach(async (element) => {
      await axios.get(element.api).then((res) => {
        if (res.status === 200) {
          let next = res.data.predictions.direction.prediction[0];

          axios
            .get(
              `https://webservices.umoiq.com/service/publicJSONFeed?command=routeConfig&a=ttc&r=${element.route}`
            )
            .then(async (res2) => {
              if (res2.status === 200) {
                let stop = res2.data.route.stop.find(
                  (itesm) => itesm.tag == element.stop
                );
          

                var position = await this.getPosition();  // wait for getPosition to complete
    
                let myLat = position.coords.latitude;
                let myLon = position.coords.longitude;
         

                let res = this.computeDistance(stop.lat,stop.lon, myLat,myLon, "K");
                console.log(res);

                let obj = {
                  route: next.branch,
                  stop: element.stop_name,
                  destination: element.destination,
                  mins: next.minutes,
                  index: element.index,
                  stopNum: element.stop,
                  lon: stop.lon,
                  lat: stop.lat,
                  distance: res
                };
                statusDataArray.push(obj);

                this.setState({
                  statusData: statusDataArray,
                });
              } else {
                console.log("fail");
              }
            });
        } else {
          console.log("fail");
        }
      });
    });


  }
  computeDistance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  }

  render() {
    console.log(this.state.statusData);
    let statusData = this.state.statusData;
    if (statusData != null) {
      if (statusData.length == 6) {
        statusData = statusData.sort((a, b) => a.distance - b.distance);

        return (
          <div>
            {statusData.map((ele) => (
              <div key={ele.index} className="card">
                <div className="title">
                  {ele.route} - {ele.destination} from {ele.stop}
                </div>
                <div className="title">{ele.mins} minutes</div>
              </div>
            ))}
            <button onClick={(e) => this.getData()} className="refreshButton">refresh</button>
          </div>
        );
      }
    }
  }
}

export default Home;
