import React from "react";
import Webcam from "react-webcam";
import * as tf from '@tensorflow/tfjs';
const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');
const wait = time => new Promise(resolve => setTimeout(resolve, time));

class EyeBlink extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            model: null,
            maxLeft: 0,
            maxRight: 0
        };
        this.webcamRef = React.createRef();
    }

    componentDidMount() {
        tf.setBackend('webgl');
        this.loadModel()
        this.detectPoints()
    }

    loadModel() {
        // Load the MediaPipe FaceMesh package.
        faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 }
        ).then(model => {
            console.log(model);
            this.setState({ model })
        }).catch(err => {
            console.log(err);
        });
    }

    async detectPoints() {
        const { model, count } = this.state
        const video = await this.webcamRef.current.video
        const predictions = model && await model.estimateFaces({
            input: video,
            returnTensors: false,
            flipHorizontal: true,
            predictIrises: true
        });

        if (predictions && predictions.length > 0) {
            // face
            const keypoints = predictions[0].scaledMesh;
            if (this.detectarBlink(keypoints)) {
                // Found blink
                const countN = count + 1
                // this.props.setCountEyeBlink(countN);
                console.log(countN, "blink count")
                this.setState({ count: countN })

            }
        } else {
            this.setState({
                maxLeft: 0,
                maxRight: 0
            })
        }
        await wait(40);
        await this.detectPoints()
    }
    

    detectarBlink(keypoints) {
        // point around left eye
        const leftEye_left = 263;
        const leftEye_right = 362;
        const leftEye_top = 386;
        const leftEye_buttom = 374;
        // point around right eye
        const rightEye_left = 133;
        const rightEye_right = 33;
        const rightEye_top = 159;
        const rightEye_buttom = 145;

        const leftVertical = this.calculateDistance(keypoints[leftEye_top][0], keypoints[leftEye_top][1], keypoints[leftEye_buttom][0], keypoints[leftEye_buttom][1]);
        const leftHorizontal = this.calculateDistance(keypoints[leftEye_left][0], keypoints[leftEye_left][1], keypoints[leftEye_right][0], keypoints[leftEye_right][1]);
        const eyeLeft = leftVertical / (2 * leftHorizontal);

        const rightVertical = this.calculateDistance(keypoints[rightEye_top][0], keypoints[rightEye_top][1], keypoints[rightEye_buttom][0], keypoints[rightEye_buttom][1]);
        const rightHorizontal = this.calculateDistance(keypoints[rightEye_left][0], keypoints[rightEye_left][1], keypoints[rightEye_right][0], keypoints[rightEye_right][1]);
        const eyeRight = rightVertical / (2 * rightHorizontal);

        // TODO :: Need more efficient implmentation
        const baseCloseEye = 0.1
        const limitOpenEye = 0.14
        if (this.state.maxLeft < eyeLeft) {
            this.setState({ maxLeft: eyeLeft })
        }
        if (this.state.maxRight < eyeRight) {
            this.setState({ maxRight: eyeRight })
        }

        let result = false
        if ((this.state.maxLeft > limitOpenEye) && (this.state.maxRight > limitOpenEye)) {
            if ((eyeLeft < baseCloseEye) && (eyeRight < baseCloseEye)) {
                result = true
            }
        }
        console.log(result);

        return result
    }

    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }

    render() {
        const videoConstraints = {
            facingMode: "user"
        };

        return (
            <>
                <Webcam
                    audio={false}
                    ref={this.webcamRef}
                    videoConstraints={videoConstraints}
                    screenshotFormat="image/jpeg"
                    onUserMedia={(stream) => {
                        if (stream) {
                            // this.props.setVideo(document.getElementsByTagName("video")[0]);
                            // this.props.setCanvas(document.getElementsByTagName("canvas")[0])
                        }
                    }}
                    mirrored={true}
                    className="mirroredCamCan"
                />
            </>
        )

    }
}

export default EyeBlink;
