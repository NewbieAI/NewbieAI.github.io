class Cartpole {

    static GRAVITY = -250;
    static CART_MASS = 10.0;
    static POLE_MASS = 1.0;
    static CART_WIDTH = 200;
    static POLE_LENGTH = 200;
    static XMIN = 0;
    static XMAX = 1800;
    static THETA_MIN = -Math.PI / 2;
    static THETA_MAX = Math.PI / 2;


    evolveSystem() {
        // evolve the state of the system according to the 
        // equations of motion.

        let force = (
            2000 +
            (this.weather == "rainy") * 1000 -
            (this.weather == "snowy") * 500
        );
        this.F = force * (this.rightDown - this.leftDown);
        
        let g = Cartpole.GRAVITY;
        let mp = Cartpole.POLE_MASS;
        let mc = Cartpole.CART_MASS;
        let L = Cartpole.POLE_LENGTH;
        let sin = Math.sin(this.theta);
        let cos = Math.cos(this.theta);
        let delta = (mc + mp * sin * sin) * mp * L;

        this.a = (
            (this.F + this.W + mp * L * sin * this.omega * this.omega) *
            (mp * L) + 
            (this.W * cos - mp * g * sin) *
            (-mp * L * cos)
        ) / delta;
        this.alpha = (
            (this.F + this.W + mp * L * sin * this.omega * this.omega) *
            (-mp * cos) + 
            (this.W * cos - mp * g * sin) *
            (mp + mc)
        ) / delta;

        this.x += this.v * 0.04 + 0.5 * this.a * 0.0016;
        this.v += this.a * 0.04;
        this.theta += this.omega * 0.04 + 0.5 * this.alpha * 0.0016;
        this.omega += this.alpha * 0.04;
    }

}
