import PlotTypes from "../PlotTypes"
import Wall from "../Wall"
let PlotFactory = {
    createPlot(viewer, plotType, geoFeature) {

        switch (plotType) {
            case PlotTypes.WALL:
                return new Wall(viewer, geoFeature);
        }
    }
}

export default PlotFactory;