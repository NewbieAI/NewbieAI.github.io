import numpy as np
import random as rd
import math

# File created on April 15th
# contains my own implementations of deep neural net models

# implements forward/back propagation, optimization using
# variants of gradient descent

@np.vectorize # using numpy vectorization as decorator
def linear(x):
    return x
@np.vectorize
def relu(x):
    return max(0,x)
@np.vectorize
def softplus(x):
    return math.log(1+math.exp(x))
@np.vectorize
def sigmoid(x):
    return 1/(1+math.exp(-x))
@np.vectorize
def tanh(x):
    return math.tanh(x)

# activation functions
afuncs = [linear,
          relu,
          softplus,
          sigmoid,
          tanh]

@np.vectorize
def dlinear(x):
    return 1
@np.vectorize
def drelu(x):
    return (x>=0)*1.
@np.vectorize
def dsoftplus(x):
    return 1/(1+math.exp(-x))    
@np.vectorize
def dsigmoid(x):
    sigm = 1/(1+math.exp(-x))
    return sigm*(1-sigm)
@np.vectorize
def dtanh(x):
    return 1-math.tanh(x)**2

# derivatives of activation functions
afuncs_prime = [dlinear,
                drelu,
                dsoftplus,
                dsigmoid,
                dtanh]

def softmax(H):
    H_stable = H - H.max(axis=0, keepdims=True)    
    return np.exp(H_stable)/np.exp(H_stable).sum(axis=0,keepdims=True)

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


# loss functions******************************************************
# and gradient of loss functions
def MSE(H,Y):
    # defines the mean square error
    # loss function. It is the avg
    # L2 distance between predicted
    # value h_i and observed value
    # y_i
    L2 = ((H-Y)**2).sum(axis=0)
    return 0.5*L2.mean()

def gMSE(H,Y):
    # calculates the gradient of the
    # MSE loss function, used for
    # regression problems
    return (H-Y)/H.shape[1]
    

def x_entropy(H,Y):
    # defines the cross entropy loss
    # function, used for classification
    # problems.
    # calculates the cross entropy
    # between predicted distribution P
    # and observed distribution Y,
    # where H = log(P'), P' is the
    # unnormalized version of P
    if H.shape[0]==1:
        arg = H*(1-2*Y)
        return np.sum(softplus(arg))
    else:
        H_stable = H - H.max(axis = 0, keepdims = True)
        log_P = H_stable - np.log(np.exp(H_stable).sum(axis = 0, keepdims = True))
        return np.sum(Y*(-log_P))
    

def gx_entropy(H,Y):
    # calculates the gradient of the
    # cross entropy loss function
    if H.shape[0]==1:
        return sigmoid(H)-Y
    else:
        return softmax(H)-Y

output_units = [linear,
                sigmoid,
                softmax]


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
