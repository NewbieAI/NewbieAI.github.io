import neural_net as nn

model = nn.DeepNeuralNet(5, 1, (5, 4, 4, 3), 0)

for layer in model.hidden_units:
    print(layer)
print(model.output_layer)
