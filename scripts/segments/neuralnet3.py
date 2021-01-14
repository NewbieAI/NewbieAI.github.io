class DeepNeuralNet:
    # The class contains at least 0 hidden layer
    # and exactly 1 output layer

    # To create a dnn object, specify the structure
    # and the output units of the network. The class
    # will automatically initiate the weights and
    # bias in each layer. The loss function should
    # also be provided.
    
    # 'structure' has the basic type of python 'tuple',
    # the ith element of the tuple stores the
    # number of nodes that should be created in the
    # (i+1)th layer. Note that tuple index starts
    # with 0 whereas neural net layers starts with
    # 1.

    # output_unit_option:
    # 0--> linear units are used
    # 1--> logistic sigmoid units are used
    # 2--> softmax units are used

    # loss_func_option:
    # 0--> Mean square Error loss is used
    # 1--> Cross entropy loss is used
    def __init__(self, input_D, output_D, structure, output_unit_option):
        self.depth = len(structure)
        self.hidden_units = []
        iDim = input_D
        for L in structure:
            if isinstance(L,int):
                # layer uses relu activation as default
                new_layer = Layer(iDim, L, 1)
                self.hidden_units.append(new_layer)
                iDim = L
            elif isinstance(L,tuple) and len(L)==2:
                # assuming the activation function is specified
                new_layer = Layer(iDim, L[0], L[1])
                self.hidden_units.append(new_layer)
                iDim = L[0]
            else:
                raise ValueError('Invalid structure')

        self.output_layer = Layer(iDim,output_D,0)
        self.output_type = output_init_option
        self.output_unit = output_units[output_unit_option]

        if output_unit_option==0:
            self.loss_func = MSE
            self.gloss_func = gMSE
        elif output_unit_option==1:
            self.loss_func = x_entropy
            self.gloss_func = gx_entropy
        elif output_unit_option==2:
            self.loss_func = x_entropy
            self.gloss_funnc = x_entropy
        else:
            raise ValueError('Invalid option for output unit!!')
        # gloss_func abbreviates 'gradient of the loss function'

    def save(self, model_id):
        model = {
                "layers": [x.export() for x in self.hidden_units],
                "output_layer": self.output_layer.export(),
                "output_type": self.output_type
                }
        filename = str(model_id) + ".npy"
        np.save(filename, model)

    def load(self, model_id):
        filename = str(model_id) + ".npy"
        model = np.load(filename).item()
        output_unit_option = model["output_type"]

        self.hidden_units = []
        self.output_layer = Layer(1, 1, 0)
        for parameters in model["layers"]:
            self.hidden_units.append(Layer(1, 1, 0))
            self.hidden_units[-1].import_parameters(
                    parameters[0],
                    parameters[1],
                    parameters[2],
                    )
        self.output_layer.import_parameters(
                model["output_layer"][0],
                model["output_layer"][1],
                model["output_layer"][2]
                )

        if output_unit_option==0:
            self.loss_func = MSE
            self.gloss_func = gMSE
        elif output_unit_option==1:
            self.loss_func = x_entropy
            self.gloss_func = gx_entropy
        elif output_unit_option==2:
            self.loss_func = x_entropy
            self.gloss_funnc = x_entropy
        else:
        
    def train(self,X,Y,learning_rate,iterations):
        # learns the mapping from input X to output Y,
        # using (stochastic) gradient descent
        J = []
        for i in range(iterations):
            # forward propagation:
            A = X
            for j in self.hidden_units:
                A = j.evaluate(A)
            H = self.output_layer.evaluate(A)
            J.append(self.loss_func(H,Y))
            # gH = gradient_H(J)
            gH = self.gloss_func(H,Y)
            #print(gH)

            # backward propagation:
            self.output_layer.update(gH,learning_rate)
            gA = self.output_layer.backprop(gH)

            for k in self.hidden_units[::-1]:
                k.update(gA,learning_rate)
                if k!=self.hidden_units[0]:
                    gA = k.backprop(gA)
        return J

    def predict(self,X):
        A = X
        for j in self.hidden_units:
            A = j.evaluate(A)
        H = self.output_layer.evaluate(A)
        Y_predicted = self.output_unit(H)
        return Y_predicted
