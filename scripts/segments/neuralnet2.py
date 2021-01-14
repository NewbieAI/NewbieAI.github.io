class Layer:
    # The class Layer implements a single Layer
    # of a neutral network. Specifically, it is
    # designed to carry out the following:
    # 1. Initialize a Layer with random weights
    #   The constructor can create a Layer
    #   given the dimension of the input and
    #   the number of nodes in the Layer, and
    #   automatically randomize the weights to
    #   small non-zero values.
    # 2. Compute the output of the Layer
    #   The output h(x) = a(Wx+b), where "W"
    #   denotes the weights, "b" denotes the
    #   bias, and "a" denotes activation
    #   function
    # 3. Update the weights in back propagation
    #   Given the gradient of the loss gunction with
    #   respect to each node, update its corresponding
    #   weights and bias

    
    # activation_option = 0 : linear (no activation) is used
    # activation_option = 1 : rectified linear unit is used
    # activation_option = 2 : softplus unit is used
    # activation_option = 3 : logistic sigmoidal unit is used
    # activation_option = 4 : hyperbolic tangent unit is used
    def __init__(self, input_dimension, number_of_nodes, activation_option):    
        # To create an Layer object, user should provide the dimension of
        # the input vectors, the number of nodes in the Layer, and which
        # activation function should be used.
    
        #*********** guard statements against invalid inputs
        if not (isinstance(input_dimension,int) and (input_dimension>0)):
            raise ValueError("input_dimension must be a positive integer")
        if not (isinstance(number_of_nodes,int) and (number_of_nodes>0)):
            raise ValueError("number_of_nodes must be a positive integer")
        if not (activation_option in range(5)):
            raise ValueError(
                "activation_option must be 0-4:\n\
                activation_ption = 0 : linear (no activation) is used\n\
                activation_ption = 1 : rectified linear unit is used\n\
                activation_ption = 2 : softplus unit is used\n\
                activation_ption = 3 : logistic sigmoidal unit is used\n\
                activation_ption = 4 : hyperbolic tangent unit is used"
                )
        #***************************************************
        self.option = activation_option
        self.dim = input_dimension
        self.width = number_of_nodes
        self.reset()
        self.afunc = afuncs[self.option]
        self.afunc_prime = afuncs_prime[self.option]
    def import_parameters(self,weights,bias,activation_option):
        #Guard against invalid inputs*************************
        if not (isinstance(weights,np.ndarray) and isinstance(bias,np.ndarray)):
            raise ValueError("weights and bias must be rank 2 numpy arrays")
        if (weights.shape[0]!=bias.shape[0]):
            raise ValueError("Invalid inputs:\n weights and bias dimensions do not match")
        if not (activation_option in range(5)):
            raise ValueError(
                "activation_option must be 0-4:\n\
                activation_ption = 0 : linear (no activation) is used\n\
                activation_ption = 1 : rectified linear unit is used\n\
                activation_ption = 2 : softplus unit is used\n\
                activation_ption = 3 : logistic sigmondal unit is used\n\
                activation_ption = 4 : hyperbolic tangent unit is used"
                )
        #*****************************************************
        self.weights = weights
        self.bias = bias
        self.dim = weights.shape[1]
        self.width = bias.shape[0]
        self.option = activation_option
        self.afunc = afuncs[self.option]
        self.afunc_prime = afunc_prime[self.option]

    def export(self):
        # returns an object that stores all the layer information
        return [self.weights, self.bias, self.option]
        
    def reset(self):
        # resets the weights to random small values and the bias to 0
        self.weights = 0.1*np.random.randn(self.width,self.dim)
        self.bias = np.zeros((self.width,1))+0.1
        
    def evaluate(self, X):
        # Calling this functino will use forward propagation
        # to compute the output of this layer given the input
        # matrix X, where each column of X represents a different
        # input.
        # The output matrix Y returned by this function is
        # strucctured such that Y[i,j] stores the output of
        # the ith node given the jth input vector

        # Guard against invalid inputs ***********************
        if not isinstance(X,np.ndarray):
            raise ValueError('The only supported Type for X is rank 2 numpy array')
        if X.shape[0]!=self.dim:
            raise ValueError('Input Dimension Mismatch\nThis layer only accept {}-dimensional inputs'\
                             .format(self.dim))
        #*****************************************************
        # print('evaluating...')
        # implements y = a(Wx + b), broadcasting this equation
        # for all input vectors in X
        self.X = X
        self.Z = self.weights@X + self.bias
        return self.afunc(self.Z)
    
    def update(self,gradient,learning_rate):
        # Calling this function will update the weights and
        # bias in this Layer, given the gradient of the loss
        # function J(w,b,x) with respect to Y(W,b,x), and the
        # hyper-parameter learning_rate
        if not isinstance(gradient,np.ndarray):
            raise ValueError('The only supported Type for gradient is numpy ndarray')
        if gradient.shape != self.Z.shape:
            raise ValueError('Gradient dimension mismatch\n This layer has {} nodes'.format(self.width))
        if learning_rate<0 or learning_rate>0.1:
            raise ValueError("learning rate must be a small positive value")
        self.weights -= learning_rate*(gradient*self.afunc_prime(self.Z))@self.X.transpose()        
        self.bias -= learning_rate*(gradient*self.afunc_prime(self.Z)).sum(axis=1,keepdims=True)
        
    def backprop(self,gradient):
        # Calling this function will calculate the gradient
        # of the loss function with respect to the inputs
        # to this layer, using the chain rule and back-propagation
        # technique.
        pre_gradient = self.weights.transpose()@(self.afunc_prime(self.Z)*gradient)
        return pre_gradient
    
    def __str__(self):
        afunc_names = ['linear units',
                       'rectified linear units',
                       'softplus units',
                       'logistic sigmoids',
                       'hyperbolic tangents']
        str1 = 'The weights are:\n{}\n'.format(self.weights)
        str2 = 'The bias are:\n{}\n'.format(self.bias)
        str3 = 'The activation function is: {}'.format(afunc_names[self.option])
        return str1+str2+str3
        
    
    @property
    def weights(self):
        return self.__weights
    @weights.setter
    def weights(self,weights):
        self.__weights = weights
    @property
    def bias(self):
        return self.__bias
    @bias.setter
    def bias(self,bias):
        self.__bias = bias
    @property
    def option(self):
        return self.__option
    @option.setter
    def option(self,option):
        self.__option = option

